var Node = require('basis.ui').Node;
var template = require('basis.template');

var templates = template.define('app.ui.colorBar', {
    bar: resource('./template/bar.tmpl'),
    item: resource('./template/item.tmpl')
});

var Item = Node.subclass({
    template: templates.item,
    binding: {
        percentage: 'data:'
    }
});

var Bar = Node.subclass({
    template: templates.bar,
    selection: true,
    childClass: Item
});

module.exports = {
    Bar: Bar,
    Item: Item
};
