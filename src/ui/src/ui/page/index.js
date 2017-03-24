var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;
var createEvent = require('basis.event').create;
var template = require('basis.template');

var templates = template.define('app.ui', {
    page: resource('./template/page.tmpl')
});

module.exports = Node.subclass({
    template: templates.page,
    emit_open: createEvent('open'),
    emit_close: createEvent('close'),
    binding: {
        content: 'satellite:',
        type: 'type'
    },
    handler: basis.Class.extensibleProperty({
        ownerChanged: function() {
            if (this.owner) {
                this.emit_open();
                this.opened.set(true);
            } else {
                this.emit_close();
                this.opened.set(false);
            }
        }
    }),
    init: function() {
        this.opened = new Value({ value: !!this.owner });
        Node.prototype.init.call(this)
    },
    destroy: function() {
        this.destroy();
        this.opened = null;
        Node.prototype.destroy.call(this)
    }
});
