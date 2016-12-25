var Node = require('basis.ui').Node;
var Tooltip = require('app.ui.tooltip.index');

module.exports = Node.subclass({
    autoDelegate: true,
    template: resource('./template/bar.tmpl'),
    tooltipClass: Tooltip,
    childClass: {
        template: resource('./template/item.tmpl'),
        binding: {
            color: 'data:',
            width: 'data:'
        },
        action: {
            mouseOver: function() {
                this.parentNode.tooltip.content.set(basis.string.format('{group}: {count} ({width}%)', this.data));
                this.parentNode.tooltip.visible.set(true);
            },
            mouseMove: function(event) {
                this.parentNode.tooltip.bottom.set(window.innerHeight - event.pageY + 10);
                this.parentNode.tooltip.left.set(event.pageX - 10);
            },
            mouseOut: function() {
                this.parentNode.tooltip.visible.set(false);
            }
        }
    },
    init: function() {
        Node.prototype.init.call(this);

        this.tooltip = new this.tooltipClass();
    }
});
