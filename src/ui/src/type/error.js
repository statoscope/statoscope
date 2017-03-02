var entity = require('basis.entity');
var Module = require('./module');

var Error = entity.createType('Error', {
    module: Module,
    message: String
});

module.exports = Error;
