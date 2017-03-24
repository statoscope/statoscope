var entity = require('basis.entity');
var Promise = require('basis.promise');
var Value = require('basis.data').Value;
var Expression = require('basis.data.value').Expression;
var Extract = require('basis.data.dataset').Extract;
var sum = require('basis.data.index').sum;
var File = require('./file');
var Module = require('./module');
var Range = require('./range');
var utils = require('app.utils');
var envApi = rempl.createEnv(parent);

var Env = entity.createType({
    name: 'Env',
    singleton: true,
    fields: {
        name: String,
        version: String,
        file: File,
        modules: entity.calc('file', function(file) {
            return Module.byFile(file, true);
        }),
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

env.related = Value.query(env, 'data.modules');
env.retained = new Extract({
    source: env.related,
    rule: 'data.retained'
});

env.relatedAmount = Value.query(env.related, 'value.itemCount');
env.fileSize = Value.query(env, 'data.file.data.size').as(utils.roundSize);
env.fileSizePostfix = Value.query(env, 'data.file.data.size').as(utils.getPostfix);

env.retainedAmount = Value.query(env.retained, 'itemCount');
env.retainedSize = sum(env.retained, 'update', 'data.size').as(utils.roundSize);
env.retainedPostfix = sum(env.retained, 'update', 'data.size').as(utils.getPostfix);

var statusText = new Expression(
    env.relatedAmount,
    env.fileSize,
    env.fileSizePostfix,
    env.retainedAmount,
    env.retainedSize,
    env.retainedPostfix,
    function(relatedAmount, fileSize, fileSizePostfix, retainedAmount, retainedSize, retainedPostfix) {
        if (!relatedAmount) {
            return '';
        }

        var data = {
            relatedAmount: relatedAmount,
            fileSize: fileSize,
            fileSizePostfix: fileSizePostfix,
            retainedAmount: retainedAmount,
            retainedSize: retainedSize,
            retainedPostfix: retainedPostfix
        };
        var file = '-';
        var retained = '-';

        if (relatedAmount) {
            file = basis.string.format('{fileSize} {fileSizePostfix}', data);
        }

        if (retainedAmount) {
            retained = basis.string.format('{retainedAmount} modules in {retainedSize} {retainedPostfix}', data);
        }

        return basis.string.format('Original size: {0}; Retained: {1}', [file, retained]);
    }
);

statusText.link(env, function(text) {
    this.setStatusBarContent(text);
});

/** @cut */ basis.dev.log('env', env);

module.exports = env;
