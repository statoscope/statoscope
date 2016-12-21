var entity = require('basis.entity');

var Asset = require('./asset');
var Module = require('./module');

var Profile = entity.createType({
    name: 'Profile',
    fields: {
        version: String,
        hash: String,
        context: String,
        chunks: Array,
        assets: entity.createSetType(Asset),
        modules: entity.createSetType(Module),
        errors: Array,
        warnings: Array,
        hasErrors: Boolean,
        hasWarnings: Boolean
    }
});

module.exports = Profile;
