var Node = require('basis.ui').Node;
var template = require('basis.template');
var Cell = require('../cell/index');

var templates = template.define('app.ui.table', {
    foot: resource('./template/foot.tmpl')
});

module.exports = Node.subclass({
    template: templates.foot,
    childClass: Cell
});
