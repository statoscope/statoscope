var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var type = require('app.type');

module.exports = new Node({
    delegate: type.Source,
    template: resource('./template/view.tmpl'),
    binding: {
        version: Value.query('data.profile.data.version').as(function(version) {
            return version || 'n/a';
        }),
        hash: Value.query('data.profile.data.hash').as(function(hash) {
            return hash || 'n/a';
        }),
        status: 'data:status',
        assets: Value.query('data.profile.data.assets.itemCount').as(Number),
        modules: Value.query('data.profile.data.modules.itemCount').as(Number),
        chunks: Value.query('data.profile.data.chunks').as(basis.getter('length').as(Number)),
        errors: Value.query('data.profile.data.errors.itemCount').as(Number),
        warnings: Value.query('data.profile.data.warnings.itemCount').as(Number),
        modulesTable: 'satellite:',
        assetsTable: 'satellite:'
    }
});
