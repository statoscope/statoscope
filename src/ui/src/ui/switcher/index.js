var resolveValue = require('basis.data').resolveValue;
var event = require('basis.event');
var Node = require('basis.ui').Node;
var templates = require('basis.template').define('app.ui.switcher', {
    switcher: resource('./template/list.tmpl'),
    item: resource('./template/item.tmpl')
});

var Item = Node.subclass({
    template: templates.item,
    counter: 0,
    counterRA_: null,
    visible: true,
    visibleRA_: null,
    emit_counterChanged: event.create('counterChanged'),
    emit_visibleChanged: event.create('visibleChanged'),
    propertyDescriptors: {
        counter: 'counterChanged',
        visible: 'visibleChanged'
    },
    binding: {
        title: 'title',
        counter: {
            events: 'counterChanged',
            getter: basis.getter('counter')
        },
        visible: {
            events: 'visibleChanged',
            getter: basis.getter('visible')
        }
    },
    init: function() {
        Node.prototype.init.call(this);

        this.setCounter(this.counter);
        this.setVisible(this.visible);
    },
    setCounter: function(value) {
        value = resolveValue(this, this.setCounter, value, 'counterRA_');

        if (this.counter !== value) {
            this.counter = value;
            this.emit_counterChanged();
        }
    },
    setVisible: function(value) {
        value = resolveValue(this, this.setVisible, value, 'visibleRA_');

        if (this.visible !== value) {
            this.visible = value;
            this.emit_visibleChanged();
        }
    },
    destroy: function() {
        this.counterRA_ && resolveValue(this, null, null, 'counterRA_');
        this.visibleRA_ && resolveValue(this, null, null, 'visibleRA_');
        Node.prototype.destroy.call(this);
    }
});

var Switcher = Node.subclass({
    template: templates.switcher,
    selection: true,
    childClass: Item
});

module.exports = {
    Switcher: Switcher,
    Item: Item
};
