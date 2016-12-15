var Node = require('basis.ui').Node;
var Row = require('./modules/row/index');

module.exports = Node.subclass({
    active: basis.PROXY,
    autoDelegate: true,
    template: resource('./template/table.tmpl'),
    childClass: Row,
    binding: {
        head: 'satellite:',
        foot: 'satellite:'
    }
});
