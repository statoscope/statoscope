'use strict';

var NAME = 'webpack-runtime-analyzer';
var parseQuery = require('loader-utils/lib/parseQuery.js');
var webpack = require('webpack');
var RequestShortener = require('webpack/lib/RequestShortener');
var fork = require('child_process').fork;
var rempl = require('rempl');
var path = require('path');
var fs = require('fs');
var opn = require('opn');

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

function handleFile(file, handledFiles) {
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

function getModuleLoaders(module, handledFiles) {
    return (module.loaders || []).map(function(loaderInfo) {
        var options = loaderInfo.options;

        if (typeof loaderInfo.options == 'string') {
            if (loaderInfo.options[0] != '?') {
                loaderInfo.options = '?' + loaderInfo.options;
            }

            options = parseQuery(loaderInfo.options);
        }

        return {
            file: handleFile(loaderInfo.loader, handledFiles),
            options: options
        };
    });
}

function startRemplServer(plugin) {
    console.info('Starting rempl server...');

    fork(path.resolve(__dirname, 'server.js'), { silent: true })
        .once('exit', function(code) {
            console.error('\n[ERROR] RuntimeAnalyzerPlugin exited with code', code);
            process.exit(code);
        })
        .on('message', function(data) {
            if (data && data.event === 'server-started') {
                plugin.publisher.wsendpoint = data.endpoint;
                plugin.publisher.sync();

                if (plugin.options.open) {
                    opn(data.endpoint);
                }
            }
        })
        .send({
            name: NAME,
            port: plugin.options.port
        });
}

function createPublisher(compiler, options) {
    // use require.main.require to get version of inspecting webpack
    // but not a webpack version uses as dependency
    var webpackVersion = require.main.require('webpack/package.json').version;
    var modulesTypeMap = {
        NormalModule: 'normal',
        MultiModule: 'multi',
        ContextModule: 'context',
        DelegatedModule: 'delegated',
        ExternalModule: 'external'
    };

    var getWebUI = rempl.scriptFromFile(options.ui);
    var publisher = rempl.createPublisher(NAME, function(settings, callback) {
        if (settings.dev) {
            return callback(null, 'url', 'http://localhost:8001/src/ui/');
        }

        getWebUI(settings, callback);
    }, {
        manualSync: options.mode === 'standalone'
    });

    var status = publisher.ns('status');
    var progress = publisher.ns('progress');
    var profile = publisher.ns('profile');
    var stats;

    compiler.plugin('compilation', function(compilation) {
        stats = compilation;
        requestShortener = new RequestShortener(compilation.options.context || process.cwd());
    });

    compiler.apply(new webpack.ProgressPlugin(function(percent) {
        status.publish('compiling');
        progress.publish(percent);
    }));

    compiler.plugin('emit', function(compilation, done) {
        var assets = [];
        var modulesMap = {};
        var chunksMap = {};
        var modules;
        var chunks;
        var fileModulesMap = {};
        var entryPoints = {};
        var handledFiles = {};

        for (var assetName in compilation.assets) {
            if (compilation.assets.hasOwnProperty(assetName)) {
                assets.push({
                    name: assetName,
                    size: compilation.assets[assetName].size()
                });
            }
        }

        chunks = compilation.chunks.map(function(chunk) {
            var chunkInfo = {
                id: chunk.id,
                name: chunk.name,
                size: chunk.size({}),
                hash: chunk.renderedHash,
                files: chunk.files,
                reasons: chunk.parents.map(function(chunk) {
                    return chunk.id;
                }),
                dependencies: chunk.modules.map(function(module) {
                    return getModuleId(module);
                }),
                rendered: chunk.rendered,
                // webpack 1.x capability
                initial: typeof chunk.isInitial == 'function' ? chunk.isInitial() : chunk.initial,
                // webpack 1.x capability
                entry: typeof chunk.hasRuntime == 'function' ? chunk.hasRuntime() : chunk.entry
            };

            chunksMap[chunkInfo.id] = chunksMap;

            return chunkInfo
        });

        modules = compilation.modules.map(function(module) {
            var moduleType = modulesTypeMap[module.constructor.name] || 'unknown';
            var resource = module.resource ? handleFile(module.resource, handledFiles) : null;

            // webpack 1.x capability
            if (/^1\./.test(webpackVersion)) {
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
                loaders: getModuleLoaders(module, handledFiles),
                dependencies: module.dependencies
                    .filter(function(dependency) {
                        return dependency.module;
                    })
                    .map(function(dependency) {
                        return getModuleId(dependency.module);
                    }),
                reasons: module.reasons
                    .filter(function(reason) {
                        return reason.dependency && reason.module;
                    })
                    .map(function(reason) {
                        return getModuleId(reason.module);
                    })
            };

            if (resource) {
                var mapItem = fileModulesMap[resource.name];

                if (mapItem) {
                    mapItem.push(moduleInfo.id);
                } else {
                    fileModulesMap[resource.name] = [moduleInfo.id];
                }
            }

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

        var profileData = {
            version: webpackVersion,
            hash: compilation.hash,
            context: compilation.compiler.context,
            assets: assets,
            chunks: chunks,
            modules: modules,
            moduleLinks: modules.reduce(function(prev, current) {
                var links = current.dependencies.map(function(dependency) {
                    return {
                        from: current.id,
                        to: dependency
                    };
                });

                return prev.concat(links);
            }, []),
            fileLinks: Object.keys(fileModulesMap).map(function(fileName) {
                return {
                    id: fileName,
                    file: fileName,
                    modules: fileModulesMap[fileName]
                };
            }),
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

        profile.publish(profileData);

        done();

        if (publisher.wsendpoint) {
            // use timer to output link after all the stats is shown
            setTimeout(function() {
                console.log('\nWebpack Runtime Analyzer web interface:', publisher.wsendpoint);
            });
        }
    });

    compiler.plugin('compile', function() {
        status.publish('compiling');
    });

    compiler.plugin('invalid', function() {
        status.publish('invalidated');
    });

    compiler.plugin('done', function() {
        status.publish(stats.errors.length ? 'failed' : 'success');
    });

    compiler.plugin('failed', function() {
        status.publish('failed');
    });

    return publisher;
}

function RuntimeAnalyzerPlugin(options) {
    this.publisher = null;

    // mix with default options
    this.options = deepExtend({
        mode: 'standalone',
        port: 0,
        watchModeOnly: true,
        ui: path.resolve(__dirname, '../../dist/script.js')
    }, options);
}

RuntimeAnalyzerPlugin.prototype.apply = function(compiler) {
    var options = this.options;
    var pluginMode = options.watchModeOnly ? 'watch-run' : 'run';

    compiler.plugin(pluginMode, function(watching, done) {
        if (!this.publisher) {
            this.publisher = createPublisher(compiler, options);

            // run server after publisher is created
            // since server uses publisher when started
            if (options.mode === 'standalone') {
                startRemplServer(this);
            }
        }

        done();
    }.bind(this));
};

module.exports = RuntimeAnalyzerPlugin;
