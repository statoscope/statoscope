var Node = require('basis.ui').Node;
var template = require('basis.template');
var Row = require('./modules/row/index');

var templates = template.define('app.ui.table', {
    table: resource('./template/table.tmpl')
});

module.exports = Node.subclass({
    template: templates.table,
    childClass: Row,
    binding: {
        head: 'satellite:',
        foot: 'satellite:'
    }
});
