var entity = require('basis.entity');
var Profile = require('./profile');

var Source = entity.createType({
    name: 'Source',
    singleton: true,
    fields: {
        status: String,
        progress: Number,
        profile: Profile
    }
});

var source = Source({});

/** @cut */ basis.dev.log('source', source);

rempl.getSubscriber(function(api) {
    api.ns('progress').subscribe(function(data) {
        /** @cut */ basis.dev.log('channel(progress)', data);
        source.update({ progress: data });
    });

    api.ns('profile').subscribe(function(data) {
        /** @cut */ basis.dev.log('channel(profile)', data);
        source.update({ profile: Profile.reader(data) });
    });

    api.ns('status').subscribe(function(data) {
        /** @cut */ basis.dev.log('channel(status)', data);
        source.update({ status: data });
    });
});

module.exports = source;
