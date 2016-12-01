var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var type = require('app.type');

module.exports = new Node({
    active: basis.PROXY,
    template: resource('./template/page.tmpl'),
    satellite: {
        modulesTable: {
            instance: resource('../../modules/modules/index.js'),
            delegate: type.Source
        },
        assetsTable: {
            instance: resource('../../modules/assets/index.js'),
            delegate: type.Source
        }
    },
    binding: {
        version: Value.query('data.profile.data.version').as(function(version) {
            return version || 'n/a';
        }),
        hash: Value.query('data.profile.data.hash').as(function(hash) {
            return hash || 'n/a';
        }),
        assets: Value.query('data.profile.data.assets').as(basis.getter('length').as(Number)),
        modules: Value.query('data.profile.data.modules').as(basis.getter('length').as(Number)),
        chunks: Value.query('data.profile.data.chunks').as(basis.getter('length').as(Number)),
        errors: Value.query('data.profile.data.errors').as(basis.getter('length').as(Number)),
        warnings: Value.query('data.profile.data.warnings').as(basis.getter('length').as(Number)),
        modulesTable: 'satellite:',
        assetsTable: 'satellite:'
    }
});
