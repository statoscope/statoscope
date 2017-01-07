var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var event = require('basis.event');
var resolveValue = require('basis.data').resolveValue;
var template = require('basis.template');
var eventUtils = require('basis.dom.event');

var templates = template.define('app.ui', {
    overlay: resource('./template/overlay.tmpl')
});
var KEY_ESC = 27;

function keyDownHandler(event) {
    if (event.keyCode == KEY_ESC) {
        this.setDelegate(null);
    }
}

module.exports = Node.subclass({
    container: document.body,
    template: templates.overlay,
    visible: Value.query('delegate').as(Boolean),
    visibleRA_: null,
    emit_visibleChanged: event.create('visibleChanged'),
    propertyDescriptors: {
        visible: 'visibleChanged'
    },
    binding: {
        visible: {
            events: 'visibleChanged',
            getter: basis.getter('visible')

        }
    },
    action: {
        clickBackground: function() {
            this.setDelegate(null);
        }
    },
    setVisible: function(value) {
        value = resolveValue(this, this.setVisible, value, 'visibleRA_');

        if (this.visible !== value) {
            if (value) {
                eventUtils.addGlobalHandler('keydown', keyDownHandler, this);
            } else {
                eventUtils.removeGlobalHandler('keydown', keyDownHandler, this);
            }

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
        eventUtils.removeGlobalHandler('keydown', keyDownHandler, this);
    }
});
