var entity = require('basis.entity');

var Asset = entity.createType('Asset', {
    name: entity.StringId,
    size: Number
});

module.exports = Asset;
