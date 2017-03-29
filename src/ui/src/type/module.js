var entity = require('basis.entity');
var DatasetWrapper = require('basis.data').DatasetWrapper;
var Filter = require('basis.data.dataset').Filter;
var MapFilter = require('basis.data.dataset').MapFilter;
var Split = require('basis.data.dataset').Split;
var type = require('basis.type');
var File = require('./file');
var utils = require('app.utils');
var ModuleLoader = require('./module-loader');
var options = require('app.options');

var Module = entity.createType('Module', {
    id: entity.StringId,
    type: type.enum(['normal', 'multi', 'context', 'delegated', 'external', 'unknown']).default('unknown'),
    name: String,
    index: Number,
    size: Number,
    formattedSize: entity.calc('size', function(size) {
        return utils.roundSize(size) + ' ' + utils.getPostfix(size);
    }),
    rawRequest: String,
    userRequest: String,
    context: String,
    resource: File,
    isEntry: Boolean,
    dependencies: entity.createSetType('Module'),
    retained: entity.createSetType('Module'),
    exclusive: entity.createSetType('Module'),
    reasons: entity.createSetType('Module'),
    loaders: entity.createSetType(ModuleLoader)
});

var moduleTypeSplit = new Split({
    rule: 'data.type'
});

Module.byType = function(type, ifExists) {
    ifExists = ifExists === undefined ? false : ifExists;

    if (type) {
        return moduleTypeSplit.getSubset(type, !ifExists);
    }
};

Module.entryPoints = new Filter({
    source: Module.all,
    rule: 'data.isEntry'
});

Module.projectModules = new Filter({
    source: Module.all,
    rule: function(module) {
        if (module.data.resource) {
            return module.data.resource.data.name.indexOf('/node_modules/') == -1;
        }

        return true;
    }
});

Module.allWrapper = new DatasetWrapper({
    dataset: options.hide3rdPartyModules.as(function(hide) {
        return hide ? Module.projectModules : Module.all;
    })
});

moduleTypeSplit.setSource(Module.allWrapper);

Module.files = new MapFilter({
    source: Module.byType('normal'),
    map: function(module) {
        return module.data.resource;
    }
});

Module.allFiles = new MapFilter({
    source: new Filter({
        source: Module.all,
        rule: function(module) {
            return module.data.type == 'normal';
        }
    }),
    map: function(module) {
        return module.data.resource;
    }
});

module.exports = Module;
