var Promise = require('basis.promise');
var entity = require('basis.entity');
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

rempl.getSubscriber(function(api) {
    source.setSyncAction(function() {
        return new Promise(function(resolve) {
            api.invoke('getLast', function(data) {
                source.update(data);
                resolve();
            });
        });
    });

    api.ns('progress').subscribe(function(data) {
        /** @cut */ basis.dev.log(data);
        source.update({ progress: data });
    });

    api.ns('profile').subscribe(function(data) {
        /** @cut */ basis.dev.log(data);
        source.update({ profile: data });
    });

    api.ns('status').subscribe(function(data) {
        /** @cut */ basis.dev.log(data);
        source.update({ status: data });
    });
});

module.exports = source;
