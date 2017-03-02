var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var type = require('app.type');

module.exports = new Node({
    delegate: type.Profile(),
    template: resource('./template/view.tmpl'),
    binding: {
        version: Value.query('data.version').as(function(version) {
            return version || 'n/a';
        }),
        hash: Value.query('data.hash').as(function(hash) {
            return hash || 'n/a';
        }),
        status: 'data:',
        assets: Value.query(type.Asset.all, 'itemCount'),
        modules: Value.query(type.Module.allWrapper, 'itemCount'),
        chunks: Value.query(type.Chunk.all, 'itemCount'),
        errors: Value.query(type.Error.all, 'itemCount'),
        warnings: Value.query(type.Warning.all, 'itemCount'),
        modulesTable: 'satellite:',
        assetsTable: 'satellite:'
    }
});
