var entity = require('basis.entity');

var File = entity.createType('File', {
    name: String,
    size: Number
});

module.exports = File;
