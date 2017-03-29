var entity = require('basis.entity');
var Module = require('./module');

var Chunk = entity.createType('Chunk', {
    id: entity.IntId,
    name: String,
    size: Number,
    hash: String,
    files: Array,
    reasons: entity.createSetType('Chunk'),
    dependencies: entity.createSetType(Module),
    rendered: Boolean,
    initial: Boolean,
    entry: Boolean
});

module.exports = Chunk;
