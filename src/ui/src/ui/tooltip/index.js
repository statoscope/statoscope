var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var template = require('basis.template');

var templates = template.define('app.ui', {
    tooltip: resource('./template/tooltip.tmpl')
});

module.exports = Node.subclass({
    container: document.body,
    template: templates.tooltip,
    binding: {
        bottom: 'bottom',
        left: 'left',
        visible: 'visible',
        content: 'content'
    },
    init: function() {
        Node.prototype.init.call(this);

        this.bottom = new Value({ value: 0 });
        this.left = new Value({ value: 0 });
        this.visible = new Value({ value: false });
        this.content = new Value({ value: '' });

        var sizes;

        this.visible.link(this, function(visible) {
            if (visible) {
                sizes = this.element.getBoundingClientRect();
            }
        });

        this.left.link(this, function(left) {
            if (sizes && left > window.innerWidth - sizes.width) {
                this.left.set(window.innerWidth - sizes.width);
            }
        });
    }
});
