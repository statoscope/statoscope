'use strict';

var loaderUtils = require('loader-utils');
var webpack = require('webpack');
var RequestShortener = require('webpack/lib/RequestShortener');
var rempl = require('rempl');
var path = require('path');
var fs = require('fs');

var COMPILATION;
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

            options = loaderUtils.parseQuery(loaderInfo.options);
        }

        return {
            file: handleFile(loaderInfo.loader),
            options: options
        };
    });
}

function RuntimeAnalyzerPlugin(options) {
    var defaultOptions = {
        ui: {
            script: path.resolve(__dirname, '../../dist/script.js')
        }
    };

    this.options = deepExtend({}, defaultOptions, options);
}

RuntimeAnalyzerPlugin.prototype.apply = function(compiler) {
    compiler.plugin('watch-run', function(watching, done) {
        var options = this.options;

        this.transport = rempl.createPublisher('webpack analyzer', function(settings, callback) {
            if (settings.dev) {
                return callback(null, 'url', 'http://localhost:8001/src/ui/');
            }

            if (options.ui.url) {
                callback(null, 'url', options.ui.url);
            } else {
                rempl.scriptFromFile(options.ui.script)(settings, callback);
            }
        });

        compiler.plugin('compilation', function(compilation) {
            COMPILATION = compilation;
            requestShortener = new RequestShortener(compilation.options.context || process.cwd());
        });

        compiler.apply(new webpack.ProgressPlugin(function(percent) {
            this.transport.ns('status').publish('compiling');
            this.transport.ns('progress').publish(percent);
        }.bind(this)));

        compiler.plugin('emit', function(compilation, done) {
            var assets = [];
            var modules;
            var profile;
            var webpackVersion = require.main.require('webpack/package.json').version;

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
                    context: module.context,
                    resource: resource,
                    reasons: module.reasons.filter(function(reason) {
                        return reason.dependency && reason.module;
                    }).map(function(reason) {
                        return getModuleId(reason.module);
                    }),
                    loaders: getModuleLoaders(module)
                };

                return moduleInfo;
            });

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
                        entry: typeof chunk.hasRuntime == 'function' ? chunk.hasRuntime() : chunk.entry,
                    };
                }),
                modules: modules,
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

            this.transport.ns('profile').publish(profile);
            done();
        }.bind(this));

        compiler.plugin('compile', function() {
            this.transport.ns('status').publish('compiling');
        }.bind(this));

        compiler.plugin('invalid', function() {
            this.transport.ns('status').publish('invalidated');
        }.bind(this));

        compiler.plugin('done', function() {
            this.transport.ns('status').publish(COMPILATION.errors.length ? 'failed' : 'success');
        }.bind(this));

        compiler.plugin('failed', function() {
            this.transport.ns('status').publish('failed');
        }.bind(this));
        done();
    }.bind(this));
};

module.exports = RuntimeAnalyzerPlugin;
