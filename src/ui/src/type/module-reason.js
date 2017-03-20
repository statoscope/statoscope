var entity = require('basis.entity');
var Range = require('./range');

var ModuleReason = entity.createType('ModuleReason', {
    module: 'Module',
    loc: Range
});

module.exports = ModuleReason;
