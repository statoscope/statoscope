var entity = require('basis.entity');
var ResolvingItem = require('./resolvingItem');

var Resolving = entity.createType('Resolving', {
    source: String,
    target: String,
    query: String,
    stack: entity.createSetType(ResolvingItem)
});

module.exports = Resolving;
