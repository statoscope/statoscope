var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;
var template = require('basis.template');

var templates = template.define('app.ui.issueList', {
    list: resource('./template/list.tmpl'),
    item: resource('./template/item.tmpl')
});

module.exports = Node.subclass({
    template: templates.list,
    childClass: {
        template: templates.item,
        binding: {
            header: Value.query('data.module.data.name').as(function(name) {
                return name || 'unknown';
            }),
            message: 'data:'
        }
    }
});
