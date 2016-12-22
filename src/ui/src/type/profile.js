var entity = require('basis.entity');

var Asset = require('./asset');
var Module = require('./module');
var Issue = require('./issue');

var Profile = entity.createType('Profile', {
    version: String,
    hash: String,
    context: String,
    chunks: Array,
    assets: entity.createSetType(Asset),
    modules: entity.createSetType(Module),
    errors: entity.createSetType(Issue),
    warnings: entity.createSetType(Issue),
    hasErrors: Boolean,
    hasWarnings: Boolean
});

module.exports = Profile;
