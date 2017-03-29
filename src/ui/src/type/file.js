var entity = require('basis.entity');
var utils = require('app.utils');

var File = entity.createType('File', {
    name: entity.StringId,
    short: String,
    size: Number,
    formattedSize: entity.calc('size', function(size) {
        return utils.roundSize(size) + ' ' + utils.getPostfix(size);
    }),
    basename: entity.calc('name', basis.path.basename),
    extname: entity.calc('name', basis.path.extname)
});

module.exports = File;
