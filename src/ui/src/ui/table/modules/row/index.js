var Node = require('basis.ui').Node;
var template = require('basis.template');
var Cell = require('../cell/index');

var templates = template.define('app.ui.table', {
    row: resource('./template/row.tmpl')
});

module.exports = Node.subclass({
    template: templates.row,
    childClass: Cell
});
