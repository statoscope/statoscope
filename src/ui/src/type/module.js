var entity = require('basis.entity');
var File = require('./file');
var Loader = require('./loader');
var Resolving = require('./resolving');

var Module = entity.createType('Module', {
    name: entity.StringId,
    index: Number,
    size: Number,
    rawRequest: String,
    context: String,
    resource: String,
    files: entity.createSetType(File),
    reasons: entity.createSetType('Module'),
    loaders: entity.createSetType(Loader),
    resolving: entity.createSetType(Resolving)
});

module.exports = Module;
