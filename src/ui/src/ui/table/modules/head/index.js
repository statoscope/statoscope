var Node = require('basis.ui').Node;
var template = require('basis.template');
var Cell = require('../cell/index');

var templates = template.define('app.ui.table.head', {
    head: resource('./template/head.tmpl'),
    cell: resource('./template/cell.tmpl')
});

module.exports = Node.subclass({
    template: templates.head,
    childClass: Cell.subclass({
        template: templates.cell
    })
});
