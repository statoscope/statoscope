var entity = require('basis.entity');
var Promise = require('basis.promise');
var Value = require('basis.data').Value;
var Expression = require('basis.data.value').Expression;
var sum = require('basis.data.index').sum;
var File = require('./file');
var Module = require('./module');
var FileLink = require('./file-link');
var Range = require('./range');
var utils = require('app.utils');
var envApi = require('app.transport').api.env;

var Env = entity.createType({
    name: 'Env',
    singleton: true,
    fields: {
        name: String,
        version: String,
        file: File,
        modules: entity.createSetType(Module),
        syntax: String,
        selections: entity.createSetType(Range)
    }
});

var env = Env();

Value.query(env, 'data.file').as(function(file) {
    if (file) {
        return FileLink.get(file.data.name);
    }
}).pipe('update', 'data.modules').as(function(modules) {
    env.set('modules', modules)
});

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

env.setStatusBarContent = function(content) {
    var payload = {
        type: 'setStatusBarContent',
        content: content || ''
    };

    envApi.send(payload);
};

envApi.subscribe(function(data) {
    switch (data.type) {
        case 'hostInfo':
            env.update(data.host);
            break;
        case 'activeTabChanged':
            if (data.tab.isEditor) {
                if (data.file.path && File.get(data.file.path)) {
                    env.update({
                        file: data.file.path,
                        syntax: data.file.syntax,
                        selections: data.selections
                    });

                    return null;
                }
            }

            env.set('file', null);

            if (env.data.selections) {
                env.data.selections.clear();
            }
            break;
        case 'selectionChanged':
            env.set('selections', data.selections);
            break;
        case 'patchChanged':
            if (data.path && File.get(data.path)) {
                env.set('file', data.path);

                return null;
            }

            env.set('file', null);

            if (env.data.selections) {
                env.data.selections.clear();
            }
            break;
        case 'syntaxChanged':
            env.set('syntax', data.syntax);
            break;
    }
});

var file = Value.query(env, 'data.file');
var modules = Value.query(env, 'data.modules');
var required = modules.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.dependencies');
});
var occurrences = modules.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.reasons');
});
var retained = modules.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.retained');
});
var exclusive = modules.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.exclusive');
});

env.requiredAmount = Value.query(required, 'value.itemCount');
env.requiredSize = sum(required, 'update', 'data.size');
env.requiredFormattedSize = env.requiredSize.as(function(size) {
    return utils.roundSize(size) + utils.getPostfix(size);
});

env.occurrencesAmount = Value.query(occurrences, 'value.itemCount');
env.occurrencesSize = sum(occurrences, 'update', 'data.size');
env.occurrencesFormattedSize = env.occurrencesSize.as(function(size) {
    return utils.roundSize(size) + utils.getPostfix(size);
});

env.retainedAmount = Value.query(retained, 'value.itemCount');
env.retainedSize = sum(retained, 'update', 'data.size');
env.retainedFormattedSize = env.retainedSize.as(function(size) {
    return utils.roundSize(size) + utils.getPostfix(size);
});

env.exclusiveAmount = Value.query(exclusive, 'value.itemCount');
env.exclusiveSize = sum(exclusive, 'update', 'data.size');
env.exclusiveFormattedSize = env.exclusiveSize.as(function(size) {
    return utils.roundSize(size) + utils.getPostfix(size);
});

var statusText = new Expression(
    file,
    modules,
    Value.query(file, 'value.data.formattedSize'),
    sum(modules, 'update', 'data.size').as(function(size) {
        return utils.roundSize(size) + utils.getPostfix(size);
    }),

    env.requiredAmount,
    env.requiredFormattedSize,

    env.occurrencesAmount,
    env.occurrencesFormattedSize,

    env.retainedAmount,
    env.retainedFormattedSize,

    env.exclusiveAmount,
    env.exclusiveFormattedSize,
    function(file, modules, fileSize, modulesSize, requiredAmount, requiredSize, occurrencesAmount, occurrencesSize,
             retainedAmount, retainedSize, exclusiveAmount, exclusiveSize) {
        if (!file || !modules) {
            return '';
        }

        var data = {
            fileSize: fileSize,
            modulesSize: modulesSize,
            requiredAmount: requiredAmount,
            requiredSize: requiredSize,
            occurrencesAmount: occurrencesAmount,
            occurrencesSize: occurrencesSize,
            retainedAmount: retainedAmount,
            retainedSize: retainedSize,
            exclusiveAmount: exclusiveAmount,
            exclusiveSize: exclusiveSize
        };

        var required;
        var occurrences;
        var retained;
        var exclusive;

        if (requiredAmount) {
            required = basis.string.format('Require: {requiredAmount} in {requiredSize}', data);
        }

        if (occurrencesAmount) {
            occurrences = basis.string.format('Occurrences: {occurrencesAmount} in {occurrencesSize}', data);
        }

        if (retainedAmount) {
            retained = basis.string.format('Retained: {retainedAmount} in {retainedSize}', data);
        }

        if (exclusiveAmount) {
            exclusive = basis.string.format('Exclusive: {exclusiveAmount} in {exclusiveSize}', data);
        }

        var parts = [
            'Modules size: ' + modulesSize,
            required,
            occurrences,
            retained,
            exclusive
        ];

        return parts.filter(Boolean).join('; ');
    }
);

statusText.link(env, function(text) {
    this.setStatusBarContent(text);
});

/** @cut */ basis.dev.log('env', env);

module.exports = env;
