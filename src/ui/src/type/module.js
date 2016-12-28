var entity = require('basis.entity');
var File = require('./file');
var Loader = require('./loader');

var Module = entity.createType('Module', {
    id: entity.IntId,
    name: String,
    size: Number,
    files: entity.createSetType(File),
    reasons: entity.createSetType('Module'),
    loaders: entity.createSetType(Loader)
});

module.exports = Module;
