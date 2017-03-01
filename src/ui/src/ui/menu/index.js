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
        { id: 'errors', binding: { counter: Value.query(type.Error.all, 'itemCount') } },
        { id: 'warnings', binding: { counter: Value.query(type.Warning.all, 'itemCount') } },
        { id: 'graph' },
        { id: 'fileMap' }
    ],
    binding: {
        version: version
    }
});
