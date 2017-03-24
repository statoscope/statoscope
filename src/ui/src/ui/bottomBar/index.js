var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var event = require('basis.event');
var resolveValue = require('basis.data').resolveValue;
var template = require('basis.template');

var templates = template.define('app.ui', {
    bottomBar: resource('./template/template.tmpl')
});

module.exports = Node.subclass({
    template: templates.bottomBar,
    visible: true,
    visibleRA_: null,
    emit_visibleChanged: event.create('visibleChanged'),
    propertyDescriptors: {
        visible: 'visibleChanged'
    },
    binding: {
        visible: {
            events: 'visibleChanged',
            getter: basis.getter('visible')

        },
        content: 'satellite:'
    },
    setVisible: function(value) {
        value = resolveValue(this, this.setVisible, value, 'visibleRA_');

        if (this.visible !== value) {
            this.visible = value;
            this.emit_visibleChanged();
        }
    },
    init: function() {
        var visible = this.visible;

        Node.prototype.init.call(this);

        this.visible = null;
        this.setVisible(visible);
    },
    destroy: function() {
        this.visibleRA_ && resolveValue(this, null, null, 'visibleRA_');

        Node.prototype.destroy.call(this);
    }
});
