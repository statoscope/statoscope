var entity = require('basis.entity');
var File = require('./file');

var ModuleLoader = entity.createType('ModuleLoader', {
    file: File,
    options: Object
});

module.exports = ModuleLoader;
