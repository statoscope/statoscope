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

function RemplPlugin(options) {
    var defaultOptions = {
        url: 'http://localhost:8177',
        ui: {
            // lazy fetching the UI
            get script() {
                if (!this.__bundleCache) {
                    this.__bundleCache = fs.readFileSync(path.resolve(__dirname, '../../dist/ui/script.js'), 'utf-8');
                }

                return this.__bundleCache;
            }
        }
    };

    options = deepExtend({}, defaultOptions, options);

    this.lastStatus = '';
    this.lastProgress = 0;
    this.lastProfile = {};

    this.transport = rempl.createPublisher('webpack analyzer', function(settings, callback) {
        if (options.ui.url) {
            callback(null, 'url', options.ui.url);
        } else {
            callback(null, 'script', options.ui.script);
        }
    }, options.url);

    this.transport.define({
        init: function() {
            // ???
        },
        getLast: function(cb) {
            // console.log('get last');

            cb({
                status: this.lastStatus,
                progress: this.lastProgress,
                profile: this.lastProfile
            });
        }.bind(this)
    });
}

RemplPlugin.prototype.apply = function(compiler) {
    compiler.apply(new webpack.ProgressPlugin(function(percent) {
        this.lastStatus = 'compiling';
        this.transport.ns('status').publish(this.lastStatus);
        this.transport.ns('progress').publish(percent);
        this.lastProgress = percent;
    }.bind(this)));

    compiler.plugin('emit', function(compilation, done) {
        var stats = compilation.getStats();
        var buildFiles = {};

        this.lastProfile = stats.toJson();
        this.lastProfile.hasErrors = stats.hasErrors();
        this.lastProfile.hasWarnings = stats.hasWarnings();
        this.lastProfile.context = compiler.context;

        compilation.chunks.forEach(function(chunk) {
            chunk.modules.forEach(function(module) {
                var loaders = module.loaders || [];
                var fileDependencies = module.fileDependencies || [];
                var origin = [];

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
                }, buildFiles);

                this.lastProfile.modules[module.index].files = buildFiles;
            }, this);
        }, this);

        this.transport.ns('profile').publish(this.lastProfile);
        done();
    }.bind(this));

    compiler.plugin('compile', function() {
        this.lastStatus = 'compiling';
        this.transport.ns('status').publish(this.lastStatus);
    }.bind(this));

    compiler.plugin('invalid', function() {
        this.lastStatus = 'invalidated';
        this.transport.ns('status').publish(this.lastStatus);
    }.bind(this));

    compiler.plugin('done', function() {
        this.lastStatus = 'success';
        this.transport.ns('status').publish(this.lastStatus);
    }.bind(this));

    compiler.plugin('failed', function() {
        this.lastStatus = 'failed';
        this.transport.ns('status').publish(this.lastStatus);
    }.bind(this));
};

module.exports = RemplPlugin;
