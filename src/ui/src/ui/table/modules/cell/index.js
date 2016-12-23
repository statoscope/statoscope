var Node = require('basis.ui').Node;
var template = require('basis.template');

var templates = template.define('app.ui.table', {
    cell: resource('./template/cell.tmpl')
});

module.exports = Node.subclass({
    template: templates.cell,
    data: {
        content: ''
    },
    binding: {
        content: 'data:'
    }
});
