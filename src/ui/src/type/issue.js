var entity = require('basis.entity');
var Module = require('./module');

var Issue = entity.createType('Issue', {
    module: Module,
    message: String
});

module.exports = Issue;
