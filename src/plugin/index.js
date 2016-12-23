var webpack = require('webpack');
var rempl = require('rempl');
var path = require('path');
var fs = require('fs');

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
    compiler.apply(new webpack.ProgressPlugin(function(percent) {
        this.transport.ns('status').publish('compiling');
        this.transport.ns('progress').publish(percent);
    }.bind(this)));

    compiler.plugin('emit', function(compilation, done) {
        var stats = compilation.getStats();
        var profile = stats.toJson();

        profile.context = compiler.context;

        profile.errors = profile.errors.map(function(error) {
            return { text: error };
        });

        profile.warnings = profile.warnings.map(function(warning) {
            return { text: warning };
        });

        compilation.chunks.forEach(function(chunk) {
            chunk.modules.forEach(function(module) {
                var loaders = module.loaders || [];
                var fileDependencies = module.fileDependencies || [];
                var origin = [];
                var files = {};

                if (module.resource) {
                    origin.push(module.resource);
                }

                origin.concat(loaders, fileDependencies).map(function(filePath) {
                    return filePath.replace(/([^?]+).*!/, '$1');
                }).filter(function(filePath) {
                    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
                }).reduce(function(prev, current) {
                    if (!prev[current]) {
                        prev[current] = fs.statSync(current).size;
                    }

                    return prev;
                }, files);

                profile.modules[module.index].files = files;
            }, this);
        }, this);

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
        this.transport.ns('status').publish('success');
    }.bind(this));

    compiler.plugin('failed', function() {
        this.transport.ns('status').publish('failed');
    }.bind(this));
};

module.exports = RuntimeAnalyzerPlugin;
