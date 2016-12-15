var entity = require('basis.entity');

var Asset = entity.createType({
    name: 'Asset',
    fields: {
        name: String,
        size: Number
    }
});

module.exports = Asset;
