var Node = require('basis.ui').Node;
var createEvent = require('basis.event').create;

module.exports = Node.subclass({
    template: resource('./template/page.tmpl'),
    emit_open: createEvent('open'),
    emit_close: createEvent('close'),
    binding: {
        content: 'satellite:'
    },
    handler: basis.Class.nestedExtendProperty({
        ownerChanged: function() {
            if (this.owner) {
                this.emit_open();
            } else {
                this.emit_close();
            }
        }
    })
});
