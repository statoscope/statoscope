'use strict';

var parseQuery = require('loader-utils/lib/parseQuery.js');
var webpack = require('webpack');
var webpackVersion = require.main.require('webpack/package.json').version;
var RequestShortener = require('webpack/lib/RequestShortener');
var rempl = require('rempl');
var path = require('path');
var fs = require('fs');

var handledFiles;
var requestShortener;

function isObject(obj) {
    return typeof obj == 'object' && obj;
}

function cloneArray(array) {
    return array.map(function(el) {
        if (Array.isArray(el)) {
            return cloneArray(el);
        }

        if (isObject(el) && el.constructor == Object) {
            return deepExtend({}, el);
        }

        return el;
    });
}

function deepExtend(target) {
    var sources = Array.prototype.slice.call(arguments, 1);

    if (typeof target != 'object' || !target) {
        return;
    }

    for (var i = 0; i < sources.length; i++) {
        var source = sources[i];

        if (isObject(source)) {
            for (var sourceKey in source) {
                if (source.hasOwnProperty(sourceKey)) {
                    var value = source[sourceKey];

                    if (Array.isArray(value)) {
                        target[sourceKey] = cloneArray(value);
                    } else if (isObject(value) && value.constructor == Object) {
                        target[sourceKey] = deepExtend({}, value);
                    } else {
                        target[sourceKey] = value;
                    }
                }
            }
        }
    }

    return target;
}

function getRetained(module, modulesMap, exclude) {
    var stack = [module.id];
    var visited = {};

    while (stack.length) {
        var currentModuleId = stack.pop();
        var currentModule = modulesMap[currentModuleId];

        if (!exclude || currentModule != exclude) {
            for (var i = 0; i < currentModule.dependencies.length; i++) {
                var dependency = currentModule.dependencies[i];

                if (!visited[dependency]) {
                    stack.push(dependency);
                    visited[dependency] = true;
                }
            }
        }
    }

    return Object.keys(visited);
}

function getModuleId(module) {
    return module.index + '_' + module.readableIdentifier(requestShortener);
}

function handleFile(file) {
    if (handledFiles.hasOwnProperty(file)) {
        return handledFiles[file];
    }

    if (fs.existsSync(file)) {
        var stats = fs.statSync(file);

        if (!stats.isFile) {
            return null;
        }

        handledFiles[file] = {
            name: file,
            short: requestShortener.shorten(file),
            size: stats.size
        };

        return handledFiles[file];
    }

    return null;
}

function getModuleLoaders(module) {
    return (module.loaders || []).map(function(loaderInfo) {
        var options = loaderInfo.options;

        if (typeof loaderInfo.options == 'string') {
            if (loaderInfo.options[0] != '?') {
                loaderInfo.options = '?' + loaderInfo.options;
            }

            options = parseQuery(loaderInfo.options);
        }

        return {
            file: handleFile(loaderInfo.loader),
            options: options
        };
    });
}

function RuntimeAnalyzerPlugin(options) {
    var defaultOptions = {
        watchModeOnly: true,
        ui: path.resolve(__dirname, '../../dist/script.js')
    };

    this.options = deepExtend({}, defaultOptions, options);
}

function createPublisher(compiler, options) {
    var getWebUI = rempl.scriptFromFile(options.ui);
    var publisher = rempl.createPublisher('webpack-analyzer', function(settings, callback) {
        if (settings.dev) {
            return callback(null, 'url', 'http://localhost:8001/src/ui/');
        }

        getWebUI(settings, callback);
    });

    var statusChannel = publisher.ns('status');
    var progressChannel = publisher.ns('progress');
    var profileChannel = publisher.ns('profile');
    var COMPILATION;

    compiler.plugin('compilation', function(compilation) {
        COMPILATION = compilation;
        requestShortener = new RequestShortener(compilation.options.context || process.cwd());
    });

    compiler.apply(new webpack.ProgressPlugin(function(percent) {
        statusChannel.publish('compiling');
        progressChannel.publish(percent);
    }));

    compiler.plugin('emit', function(compilation, done) {
        var assets = [];
        var modulesMap = {};
        var entryPoints = {};
        var modules;
        var profile;

        handledFiles = {};

        for (var assetName in compilation.assets) {
            if (compilation.assets.hasOwnProperty(assetName)) {
                assets.push({
                    name: assetName,
                    size: compilation.assets[assetName].size()
                });
            }
        }

        modules = compilation.modules.map(function(module) {
            var modulesTypeMap = {
                NormalModule: 'normal',
                MultiModule: 'multi',
                ContextModule: 'context',
                DelegatedModule: 'delegated',
                ExternalModule: 'external'
            };
            var moduleType = modulesTypeMap[module.constructor.name] || 'unknown';
            var resource = module.resource ? handleFile(module.resource) : null;

            // webpack 1.x capability
            if (webpackVersion[0] == 1) {
                var identifier = module.identifier();

                if (!identifier.indexOf('multi')) {
                    moduleType = 'multi';
                } else if (module.regExp) {
                    moduleType = 'context';
                } else if (!identifier.indexOf('delegated')) {
                    moduleType = 'delegated';
                } else if (!identifier.indexOf('external')) {
                    moduleType = 'external';
                } else if (resource) {
                    moduleType = 'normal';
                } else {
                    moduleType = 'unknown';
                }
            }

            var moduleInfo = {
                id: getModuleId(module),
                index: module.index,
                type: moduleType,
                name: module.readableIdentifier(requestShortener),
                size: module.size(),
                rawRequest: module.rawRequest,
                userRequest: module.userRequest,
                context: module.context,
                resource: resource,
                dependencies: module.dependencies.filter(function(dependency) {
                    return dependency.module;
                }).map(function(dependency) {
                    return getModuleId(dependency.module);
                }),
                reasons: module.reasons.filter(function(reason) {
                    return reason.dependency && reason.module;
                }).map(function(reason) {
                    return getModuleId(reason.module);
                }),
                loaders: getModuleLoaders(module)
            };

            modulesMap[moduleInfo.id] = moduleInfo;
            moduleInfo.isEntry = !moduleInfo.reasons.length;

            if (moduleInfo.isEntry) {
                entryPoints[moduleInfo.id] = true;
            }

            return moduleInfo;
        });

        entryPoints = Object.keys(entryPoints);

        // console.time('Retained + Exclusive');

        modules.forEach(function(module) {
            var allSubtreeExceptSelected = {};

            module.retained = getRetained(module, modulesMap);

            if (module.retained.indexOf(module.id) == -1) {
                module.retained.push(module.id);
            }

            for (var i = 0; i < entryPoints.length; i++) {
                var nodes = getRetained(modulesMap[entryPoints[i]], modulesMap, module);

                for (var j = 0; j < nodes.length; j++) {
                    allSubtreeExceptSelected[nodes[j]] = true;
                }
            }

            module.exclusive = module.retained.filter(function(exclusive) {
                return exclusive != module.id && !allSubtreeExceptSelected[exclusive];
            });

            var ix = module.retained.indexOf(module.id);

            if (ix > -1) {
                module.retained.splice(ix, 1)
            }
        });

        // console.timeEnd('Retained + Exclusive');

        profile = {
            version: webpackVersion,
            hash: compilation.hash,
            context: compilation.compiler.context,
            assets: assets,
            chunks: compilation.chunks.map(function(chunk) {
                return {
                    id: chunk.id,
                    name: chunk.name,
                    size: chunk.size({}),
                    hash: chunk.renderedHash,
                    files: chunk.files,
                    modules: chunk.modules.map(function(module) {
                        return getModuleId(module);
                    }),
                    rendered: chunk.rendered,
                    // webpack 1.x capability
                    initial: typeof chunk.isInitial == 'function' ? chunk.isInitial() : chunk.initial,
                    // webpack 1.x capability
                    entry: typeof chunk.hasRuntime == 'function' ? chunk.hasRuntime() : chunk.entry
                };
            }),
            modules: modules,
            links: modules.reduce(function(prev, current) {
                var links = current.dependencies.map(function(dependency) {
                    return {
                        from: current.id,
                        to: dependency
                    };
                });

                return prev.concat(links);
            }, []),
            errors: compilation.errors.map(function(error) {
                return {
                    message: error.message,
                    module: error.module && getModuleId(error.module)
                };
            }),
            warnings: compilation.warnings.map(function(warning) {
                return {
                    message: warning.message,
                    module: warning.module && getModuleId(warning.module)
                };
            })
        };

        profileChannel.publish(profile);
        done();
    });

    compiler.plugin('compile', function() {
        statusChannel.publish('compiling');
    });

    compiler.plugin('invalid', function() {
        statusChannel.publish('invalidated');
    });

    compiler.plugin('done', function() {
        statusChannel.publish(COMPILATION.errors.length ? 'failed' : 'success');
    });

    compiler.plugin('failed', function() {
        statusChannel.publish('failed');
    });
}

RuntimeAnalyzerPlugin.prototype.apply = function(compiler) {
    var options = this.options;
    var pluginMode = options.watchModeOnly ? 'watch-run' : 'run';
    var inited = false;

    compiler.plugin(pluginMode, function(watching, done) {
        if (!inited) {
            createPublisher(compiler, options);
            inited = true;
        }

        done();
    });
};

module.exports = RuntimeAnalyzerPlugin;
