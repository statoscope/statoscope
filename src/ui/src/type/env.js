var entity = require('basis.entity');
var Promise = require('basis.promise');
var File = require('./file');
var Range = require('./range');
var envApi = rempl.createEnv(parent);

var Env = entity.createType({
    name: 'Env',
    singleton: true,
    fields: {
        name: String,
        version: String,
        file: File,
        syntax: String,
        selections: entity.createSetType(Range)
    }
});

var env = Env();

env.openFile = function(filePath, selections) {
    return new Promise(function(resolve, reject) {
        if (!filePath) {
            reject('no file specified');
        }

        var payload = {
            type: 'openFile',
            path: filePath,
            selections: selections
        };

        envApi.send(payload, function(response) {
            if (response.ok) {
                resolve();
            } else {
                reject(response.error.code);
            }
        });
    });
};

env.getContent = function(selections) {
    return new Promise(function(resolve, reject) {
        var payload = {
            type: 'getContent',
            selections: selections // todo not supported yet
        };

        envApi.send(payload, function(response) {
            if (response.ok) {
                resolve(response.content);
            } else {
                reject(response.error.code);
            }
        });
    });
};

envApi.subscribe(function(data) {
    switch (data.type) {
        case 'hostInfo':
            env.update(data.host);
            break;
        case 'activeTabChanged':
            if (data.tab.isEditor) {
                env.update({
                    file: data.file.path,
                    syntax: data.file.syntax,
                    selections: data.selections
                });
            } else {
                env.set('file', null);

                if (env.data.selections) {
                    env.data.selections.clear();
                }
            }
            break;
        case 'selectionChanged':
            env.set('selections', data.selections);
            break;
        case 'patchChanged':
            env.set('file', data.path);
            break;
        case 'syntaxChanged':
            env.set('syntax', data.syntax);
            break;
    }
});

/** @cut */ basis.dev.log('env', env);

module.exports = env;
