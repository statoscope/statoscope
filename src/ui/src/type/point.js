var entity = require('basis.entity');

module.exports = entity.createType('Point', {
    line: Number,
    column: Number
});
