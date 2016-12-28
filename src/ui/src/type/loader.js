var entity = require('basis.entity');

var Loader = entity.createType('Loader', {
    full: entity.StringId,
    fullShorten: String,
    path: String,
    pathShorten: String,
    query: Object
});

module.exports = Loader;
