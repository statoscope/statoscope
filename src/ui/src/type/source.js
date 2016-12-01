var Promise = require('basis.promise');
var entity = require('basis.entity');
var transport = require('app.transport');
var Profile = require('./profile');

var Source = entity.createType({
    name: 'Source',
    singleton: true,
    fields: {
        status: String,
        progress: Number,
        online: Boolean,
        profile: Profile
    }
});

var source = Source({});

source.setSyncAction(function() {
    return new Promise(function(resolve) {
        transport.invoke('getLast', function() {
            resolve();
        });
    });
});

transport.ns('progress').subscribe(function(data) {
    /** @cut */ basis.dev.log(data);
    source.update({ progress: data });
});

transport.ns('profile').subscribe(function(data) {
    /** @cut */ basis.dev.log(data);
    source.update({ profile: data });
});

transport.ns('status').subscribe(function(data) {
    /** @cut */ basis.dev.log(data);
    source.update({ status: data });
});

module.exports = source;
