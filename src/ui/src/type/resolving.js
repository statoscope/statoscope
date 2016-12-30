var entity = require('basis.entity');
var ResolvingItem = require('./resolvingItem');

var Resolving = entity.createType('Resolving', {
    context: String,
    target: String,
    resolvedTarget: String,
    stack: entity.createSetType(ResolvingItem)
});

module.exports = Resolving;
