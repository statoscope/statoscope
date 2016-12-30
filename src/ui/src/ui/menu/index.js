var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;
var type = require('app.type');

var version = new basis.Token(require('../../../../../package.json').version);

module.exports = Node.subclass({
    template: resource('./template/menu.tmpl'),
    selection: true,
    childClass: {
        template: resource('./template/item.tmpl'),
        binding: {
            id: 'id'
        }
    },
    childNodes: [
        { id: 'home', selected: true },
        { id: 'errors', binding: { errors: Value.query(type.Source, 'data.profile.data.errors.itemCount') } },
        { id: 'warnings', binding: { errors: Value.query(type.Source, 'data.profile.data.warnings.itemCount') } },
        { id: 'loaders' },
        { id: 'resolving' },
        { id: 'graph' },
        { id: 'fileMap' }
    ],
    binding: {
        version: version
    }
});
