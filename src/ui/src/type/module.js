var entity = require('basis.entity');
var Value = require('basis.data').Value;
var DatasetWrapper = require('basis.data').DatasetWrapper;
var Extract = require('basis.data.dataset').Extract;
var Filter = require('basis.data.dataset').Filter;
var MapFilter = require('basis.data.dataset').MapFilter;
var type = require('basis.type');
var File = require('./file');
var ModuleLoader = require('./module-loader');
var LS_KEY_HIDE_NON_PROJECT_MODULES = 'wraHideNonProjectModules';
var hideNonProjectModulesSaved = localStorage.getItem(LS_KEY_HIDE_NON_PROJECT_MODULES);
var hideNonProjectModules = true;

if (hideNonProjectModulesSaved && hideNonProjectModulesSaved == 'false') {
    hideNonProjectModules = false;
}

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

Module.projectFiles = new Extract({
    source: new Filter({
        source: Module.all,
        rule: function(module) {
            if (module.data.resource) {
                return module.data.resource.data.name.indexOf('/node_modules/') == -1;
            }

            return true;
        }
    }),
    rule: 'data.reasons'
});

Module.allWrapper = new DatasetWrapper();

Module.normalModules = new Filter({
    source: Module.allWrapper,
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

Module.hideNonProjectModules = new Value({
    handler: {
        change: function() {
            if (this.value) {
                Module.allWrapper.setDataset(Module.projectFiles);
            } else {
                Module.allWrapper.setDataset(Module.all);
            }

            localStorage.setItem(LS_KEY_HIDE_NON_PROJECT_MODULES, this.value);
        }
    }
});

Module.hideNonProjectModules.set(hideNonProjectModules);

module.exports = Module;
