var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var type = require('app.type');

module.exports = Node.subclass({
    delegate: type.Profile(),
    template: resource('./template/view.tmpl'),
    binding: {
        version: Value.query('data.version').as(function(version) {
            return version || 'n/a';
        }),
        status: 'data:',
        assets: Value.query(type.Asset.all, 'itemCount'),
        modules: Value.query(type.Module.all, 'itemCount'),
        chunks: Value.query(type.Chunk.all, 'itemCount'),
        modulesTable: 'satellite:',
        assetsTable: 'satellite:',
        envName: Value.query(type.Env, 'data.name'),
        envVersion: Value.query(type.Env, 'data.version')
    }
});
