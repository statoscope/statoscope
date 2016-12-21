var entity = require('basis.entity');

var Asset = entity.createType('Asset', {
    name: String,
    size: Number
});

module.exports = Asset;
