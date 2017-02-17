var entity = require('basis.entity');
var File = require('./file');

var Module = entity.createType('Module', {
    name: entity.StringId,
    index: Number,
    size: Number,
    rawRequest: String,
    context: String,
    resource: String,
    files: entity.createSetType(File),
    reasons: entity.createSetType('Module')
});

module.exports = Module;
