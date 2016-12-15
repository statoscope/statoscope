var Node = require('basis.ui').Node;

module.exports = Node.subclass({
    template: resource('./template/cell.tmpl'),
    data: {
        content: ''
    },
    binding: {
        content: 'data:'
    }
});
