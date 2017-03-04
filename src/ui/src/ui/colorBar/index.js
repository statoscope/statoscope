var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Tooltip = require('app.ui.tooltip.index');
var template = require('basis.template');

var templates = template.define('app.ui.colorBar', {
    bar: resource('./template/bar.tmpl'),
    item: resource('./template/item.tmpl'),
    tooltip: resource('./template/tooltip.tmpl')
});

module.exports = Node.subclass({
    template: templates.bar,
    selection: true,
    tooltipClass: Tooltip.subclass({
        template: templates.tooltip,
        binding: {
            type: 'data:',
            caption: 'data:',
            count: 'data:',
            percentage: {
                events: 'update',
                getter: function(node) {
                    return Number(node.data.percentage).toFixed(2);
                }
            }
        }
    }),
    childClass: {
        template: templates.item,
        binding: {
            type: 'data:',
            percentage: 'data:'
        },
        action: {
            mouseMove: function(event) {
                this.parentNode.tooltip.setBottom(window.innerHeight - event.pageY + 10);
                this.parentNode.tooltip.setLeft(event.pageX - 10);
            },
            unselect: function() {
                this.unselect();
            }
        }
    },
    init: function() {
        Node.prototype.init.call(this);

        this.tooltip = new this.tooltipClass({
            delegate: Value.query(this, 'selection.pick()')
        });
    }
});
