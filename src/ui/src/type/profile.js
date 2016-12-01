var entity = require('basis.entity');

var Profile = entity.createType({
    name: 'Profile',
    fields: {
        version: String,
        hash: String,
        chunks: Array,
        assets: Array,
        modules: Array,
        errors: Array,
        warnings: Array,
        hasErrors: Boolean,
        hasWarnings: Boolean
    }
});

module.exports = Profile;
