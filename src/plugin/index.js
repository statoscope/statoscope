var loaderUtils = require('loader-utils');
var webpack = require('webpack');
var NormalModule = require('webpack/lib/NormalModule');
var splitQuery = NormalModule.prototype.splitQuery;
var RequestShortener = require('webpack/lib/RequestShortener');
var rempl = require('rempl');
var path = require('path');
var fs = require('fs');
var async = require('async');

var handledFiles;
var requestShortener;

function deepExtend(target) {
    var sources = Array.prototype.slice.call(arguments, 1);

    if (typeof target != 'object' || !target) {
        return;
    }

    for (var i = 0; i < sources.length; i++) {
        var source = sources[i];

        if (typeof source == 'object' && source) {
            for (var sourceKey in source) {
                if (source.hasOwnProperty(sourceKey)) {
                    var value = source[sourceKey];

                    if (typeof value == 'object' && value) {
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

function handleFile(file) {
    if (handledFiles[file]) {
        return handledFiles[file];
    }

    var size = 0;

    try {
        size = fs.statSync(file).size;
    } catch (e) {
        // dummy
    }

    handledFiles[file] = {
        name: file,
        size: size
    };

    return handledFiles[file];
}

function getModuleFiles(module, loaders) {
    var fileDependencies = module.fileDependencies || [];
    var resolvedFiles = {};
    var files = [];
    var loaderFiles = loaders.map(function(loader) {
        return loader.path;
    });

    fileDependencies
        .concat(loaderFiles)
        .filter(function(filePath) {
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        })
        .reduce(function(prev, current) {
            prev[current] = handleFile(current);

            return prev;
        }, resolvedFiles);

    for (var file in resolvedFiles) {
        if (resolvedFiles.hasOwnProperty(file)) {
            files.push(resolvedFiles[file]);
        }
    }

    return files;
}

function getModuleLoaders(module) {
    return (module.loaders || []).map(function(loader) {
        return handleLoader(loader, requestShortener);
    });
}

function handleLoader(loader, shortener) {
    var loaderSplitted = splitQuery(loader);
    var loaderPath = loaderSplitted[0];
    var loaderQuery = loaderUtils.parseQuery(loaderSplitted[1]) || {};

    return {
        full: loader,
        fullShorten: shortener.shorten(loader),
        path: loaderPath,
        pathShorten: shortener.shorten(loaderPath),
        query: loaderQuery
    };
}

function resolveLoaders(compilation, nmf, callback) {
    var loaderDescriptorsList = nmf.loaders.list.concat(nmf.preLoaders.list, nmf.postLoaders.list);

    loaderDescriptorsList.forEach(function(descriptor) {
        if (nmf.loaders.list.indexOf(descriptor) > -1) {
            descriptor.type = 'loader';
        } else if (nmf.preLoaders.list.indexOf(descriptor) > -1) {
            descriptor.type = 'pre';
        } else if (nmf.postLoaders.list.indexOf(descriptor) > -1) {
            descriptor.type = 'post';
        }

        descriptor.test = normalizeDescriptorMatchers(descriptor.test);
        descriptor.include = normalizeDescriptorMatchers(descriptor.include);
        descriptor.exclude = normalizeDescriptorMatchers(descriptor.exclude);
        descriptor.loaders = descriptor.loaders || descriptor.loader || [];

        if (descriptor.loaders && !Array.isArray(descriptor.loaders)) {
            descriptor.loaders = descriptor.loaders.split('!');
        }
    });

    async.map(loaderDescriptorsList, resolveDescriptorLoaders, function(error, results) {
        results = results || [];
        results.forEach(function(loaderDescriptor) {
            loaderDescriptor.loaders = loaderDescriptor.loaders.map(function(loader) {
                return handleLoader(loader, requestShortener);
            });
        });

        callback(error, results);
    });

    function resolveDescriptorLoaders(descriptor, callback) {
        async.map(descriptor.loaders, nmf.resolvers.loader.resolve.bind(nmf.resolvers.loader, compilation.compiler.context), function(error, results) {
            descriptor.loaders = results;

            callback(error, descriptor);
        });
    }

    function normalizeDescriptorMatchers(matchers) {
        if (!matchers) {
            return;
        }

        if (!Array.isArray(matchers)) {
            matchers = [matchers];
        }

        return matchers.map(function(matcher) {
            return {
                type: matcher instanceof RegExp ? 'regexp' : 'string',
                content: matcher instanceof RegExp ? matcher.source : matcher.toString(),
                flags: matcher instanceof RegExp ? matcher.flags : ''
            };
        });
    }
}

function RuntimeAnalyzerPlugin(options) {
    var defaultOptions = {
        ui: {
            script: path.resolve(__dirname, '../../dist/script.js')
        }
    };

    options = deepExtend({}, defaultOptions, options);

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
}

RuntimeAnalyzerPlugin.prototype.apply = function(compiler) {
    var COMPILATION;
    var NMF;
    // var CMF;

    compiler.plugin('compilation', function(compilation, factories) {
        COMPILATION = compilation;
        NMF = factories.normalModuleFactory;
        // CMF = factories.contextModuleFactory;
        requestShortener = new RequestShortener(compilation.options.context || process.cwd());
    });

    compiler.apply(new webpack.ProgressPlugin(function(percent) {
        this.transport.ns('status').publish('compiling');
        this.transport.ns('progress').publish(percent);
    }.bind(this)));

    compiler.plugin('emit', function(compilation, done) {
        var modules = [];
        var assets = [];
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

        compilation.modules.forEach(function(module) {
            var moduleInfo = {
                id: module.index2,
                name: module.readableIdentifier(requestShortener),
                size: module.size(),
                files: [],
                reasons: module.reasons.filter(function(reason) {
                    return reason.dependency && reason.module;
                }).map(function(reason) {
                    return reason.module.index2;
                }),
                loaders: getModuleLoaders(module)
            };

            moduleInfo.files = getModuleFiles(module, moduleInfo.loaders);

            modules.push(moduleInfo);
        }, this);

        profile = {
            version: require('webpack/package.json').version,
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
                        return module.index2;
                    }),
                    rendered: chunk.rendered,
                    initial: chunk.initial,
                    entry: chunk.entry
                };
            }),
            modules: compilation.modules.map(function(module) {
                var moduleInfo = {
                    id: module.index2,
                    name: module.readableIdentifier(requestShortener),
                    size: module.size(),
                    files: [],
                    reasons: module.reasons.filter(function(reason) {
                        return reason.dependency && reason.module;
                    }).map(function(reason) {
                        return reason.module.index2;
                    }),
                    loaders: getModuleLoaders(module)
                };

                moduleInfo.files = getModuleFiles(module, moduleInfo.loaders);

                return moduleInfo;
            }),
            errors: compilation.errors.map(function(error) {
                return {
                    message: error.message,
                    module: error.module && error.module.index2
                };
            }),
            warnings: compilation.warnings.map(function(warning) {
                return {
                    message: warning.message,
                    module: warning.module && warning.module.index2
                };
            })
        };

        resolveLoaders(COMPILATION, NMF, function(error, result) {
            profile.loaderDescriptors = result;
            this.transport.ns('profile').publish(profile);
            done();
        }.bind(this));
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
};

module.exports = RuntimeAnalyzerPlugin;
