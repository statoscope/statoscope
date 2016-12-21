var entity = require('basis.entity');

var Module = entity.createType('Module', {
    id: String,
    name: String,
    size: Number,
    files: Object
});

module.exports = Module;
