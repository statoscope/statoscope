var entity = require('basis.entity');
var Promise = require('basis.promise');
var File = require('./file');
var envApi = rempl.createEnv(parent);

var Point = entity.createType('Point', {
    line: Number,
    column: {
        type: Number,
        defValue: 1
    }
});

var Range = entity.createType('Range', {
    start: Point,
    end: Point
});

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
            reject();
        }

        var payload = {
            type: 'openFile',
            path: filePath,
            selections: selections
        };

        envApi.send(payload, function(response) {
            if (response.status) {
                resolve();
            } else {
                reject();
            }
        });
    });
};

env.getContent = function() {
    return new Promise(function(resolve, reject) {
        var payload = {
            type: 'getContent'
        };

        envApi.send(payload, function(response) {
            if (response.status) {
                resolve(response.content);
            } else {
                reject();
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
            env.update({ file: null });

            if (env.data.selections) {
                env.data.selections.clear();
            }

            if (data.tab.isEditor) {
                var file = File.get(data.file.path);

                if (file) {
                    env.update({
                        file: file,
                        syntax: data.file.syntax,
                        selections: data.selections
                    });
                }
            }
            break;
        case 'selectionChanged':
            env.update({
                selections: data.selections
            });
            break;
        case 'patchChanged':
            env.update({ file: null });

            if (env.data.selections) {
                env.data.selections.clear();
            }

            file = File(data.path);

            if (file) {
                env.update({ file: file });
            }
            break;
        case 'syntaxChanged':
            env.update({ syntax: data.syntax });
            break;
    }
});

/** @cut */ basis.dev.log('env', env);

module.exports = env;
