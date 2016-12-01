var rempl = require('rempl').observer.nodejs;

function RemplPlugin(options) {
    var self = this;

    this.webpack = options.webpack;
    this.url = options.url;

    if (options.ui) {
        if (typeof options.ui == 'string') {
            this.ui = {
                url: options.ui
            };
        } else {
            this.ui = options.ui;
        }
    }

    this.lastStatus = '';
    this.lastProgress = 0;
    this.lastProfile = {};

    this.transport = rempl('webpack analyzer', function(settings, callback) {
        if (self.ui.url) {
            callback(null, 'url', self.ui.url);
        } else {
            callback(null, 'script', self.ui.script);
        }
    }, this.url);

    this.transport.define({
        getLast: function(cb) {
            self.transport.ns('status').send(self.lastStatus);
            self.transport.ns('progress').send(self.lastProgress);
            self.transport.ns('profile').send(self.lastProfile);
            cb();
        }
    });
}

RemplPlugin.prototype.apply = function(compiler) {
    var self = this;

    compiler.apply(new this.webpack.ProgressPlugin(function(percent, msg) {
        self.lastStatus = 'compiling';
        self.transport.ns('status').send(self.lastStatus);
        self.transport.ns('progress').send(percent);
        self.lastProgress = percent;
    }));

    compiler.plugin('emit', function(compilation, done) {
        var stats = compilation.getStats();

        self.lastProfile = stats.toJson();
        self.lastProfile.hasErrors = stats.hasErrors();
        self.lastProfile.hasWarnings = stats.hasWarnings();
        self.transport.ns('profile').send(self.lastProfile);
        done();
    });

    compiler.plugin('compile', function() {
        self.lastStatus = 'compiling';
        self.transport.ns('status').send(self.lastStatus);
    });

    compiler.plugin('invalid', function() {
        self.lastStatus = 'invalidated';
        self.transport.ns('status').send(self.lastStatus);
    });

    compiler.plugin('done', function() {
        self.lastStatus = 'success';
        self.transport.ns('status').send(self.lastStatus);
    });

    compiler.plugin('failed', function() {
        self.lastStatus = 'failed';
        self.transport.ns('status').send(self.lastStatus);
    });
};

module.exports = RemplPlugin;
