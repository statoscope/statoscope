var entity = require('basis.entity');
var Filter = require('basis.data.dataset').Filter;
var MapFilter = require('basis.data.dataset').MapFilter;
var type = require('basis.type');
var File = require('./file');
var ModuleLoader = require('./module-loader');

var Module = entity.createType('Module', {
    id: entity.StringId,
    type: type.enum(['normal', 'multi', 'context', 'delegated', 'external', 'unknown']).default('unknown'),
    name: String,
    index: Number,
    size: Number,
    rawRequest: String,
    context: String,
    resource: File,
    reasons: entity.createSetType('Module'),
    loaders: entity.createSetType(ModuleLoader)
});

Module.normalModules = new Filter({
    source: Module.all,
    rule: function(module) {
        return module.data.type == 'normal'
    }
});

Module.files = new MapFilter({
    source: Module.normalModules,
    map: function(module) {
        return module.data.resource;
    }
});

module.exports = Module;
