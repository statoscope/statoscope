var Node = require('basis.ui').Node;
var template = require('basis.template');

var templates = template.define('app.ui.issueList', {
    list: resource('./template/list.tmpl'),
    item: resource('./template/item.tmpl')
});

module.exports = Node.subclass({
    autoDelegate: true,
    template: templates.list,
    childClass: {
        template: templates.item,
        binding: {
            header: 'data:',
            text: 'data:',
            footer: 'data:'
        }
    }
});
