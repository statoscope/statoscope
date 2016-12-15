var Node = require('basis.ui').Node;
var Cell = require('../cell/index');

module.exports = Node.subclass({
    template: resource('./template/head.tmpl'),
    childClass: Cell
});
