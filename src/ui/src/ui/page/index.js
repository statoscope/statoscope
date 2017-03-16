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
            } else {
                this.emit_close();
            }
        }
    })
});
