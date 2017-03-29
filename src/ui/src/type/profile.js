var entity = require('basis.entity');
var Module = require('./module');
var Asset = require('./asset');
var Chunk = require('./chunk');
var Error = require('./error');
var Warning = require('./warning');
var ModuleLink = require('./module-link');
var FileLink = require('./file-link');

var Profile = entity.createType({
    name: 'Profile',
    singleton: true,
    fields: {
        status: String,
        progress: Number,
        version: String,
        hash: String,
        context: String
    }
});

var profile = Profile();

/** @cut */ basis.dev.log('profile', profile);

rempl.getSubscriber(function(api) {
    api.ns('progress').subscribe(function(data) {
        /** @cut */ basis.dev.log('channel(progress)', data);
        profile.update({ progress: data });
    });

    api.ns('profile').subscribe(function(data) {
        if (!data) {
            return;
        }

        /** @cut */ basis.dev.log('channel(profile)', data);
        profile.update({
            version: data.version,
            hash: data.hash,
            context: data.context
        });
        Module.all.setAndDestroyRemoved(data.modules);
        Asset.all.setAndDestroyRemoved(data.assets);
        Chunk.all.setAndDestroyRemoved(data.chunks);
        Error.all.setAndDestroyRemoved(data.errors);
        Warning.all.setAndDestroyRemoved(data.warnings);
        ModuleLink.all.setAndDestroyRemoved(data.moduleLinks);
        FileLink.all.setAndDestroyRemoved(data.fileLinks);
    });

    api.ns('status').subscribe(function(data) {
        /** @cut */ basis.dev.log('channel(status)', data);
        profile.update({ status: data });
    });
});

module.exports = Profile;
