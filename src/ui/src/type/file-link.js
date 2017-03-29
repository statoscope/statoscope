var entity = require('basis.entity');
var Module = require('./module');
var File = require('./file');

var FileLink = entity.createType('FileLink', {
    id: entity.StringId,
    file: File,
    modules: entity.createSetType(Module)
});

module.exports = FileLink;
