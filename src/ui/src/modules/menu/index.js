var Node = require('basis.ui').Node;

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
        {
            id: 'home',
            selected: true
        },
        {
            id: 'assets'
        },
        {
            id: 'modules'
        }
    ]
});
