var entity = require('basis.entity');

module.exports = entity.createType('Variable', {
    name: entity.StringId,
    expression: entity.StringId
});
