var entity = require('basis.entity');

var File = entity.createType('File', {
    name: entity.StringId,
    short: String,
    size: Number,
    basename: entity.calc('name', basis.path.basename),
    extname: entity.calc('name', basis.path.extname)
});

module.exports = File;
