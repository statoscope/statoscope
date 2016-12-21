var entity = require('basis.entity');

var Module = entity.createType({
    name: 'Module',
    fields: {
        id: String,
        name: String,
        size: Number,
        files: Object
    }
});

module.exports = Module;
