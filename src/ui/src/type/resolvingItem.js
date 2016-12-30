var entity = require('basis.entity');

var ResolvingItem = entity.createType('ResolvingItem', {
    full: String,
    type: String,
    context: String,
    target: String
});

module.exports = ResolvingItem;
