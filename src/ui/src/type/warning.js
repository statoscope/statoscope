var entity = require('basis.entity');
var Module = require('./module');

var Warning = entity.createType('Warning', {
    module: Module,
    message: String
});

module.exports = Warning;
