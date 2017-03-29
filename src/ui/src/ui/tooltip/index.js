var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var event = require('basis.event');
var resolveValue = require('basis.data').resolveValue;
var template = require('basis.template');

var templates = template.define('app.ui', {
    tooltip: resource('./template/tooltip.tmpl')
});

module.exports = Node.subclass({
    container: document.body,
    template: templates.tooltip,
    visible: Value.query('delegate').as(Boolean),
    visibleRA_: null,
    left: 0,
    leftRA_: null,
    bottom: 0,
    bottomRA_: null,
    emit_visibleChanged: event.create('visibleChanged'),
    emit_leftChanged: event.create('leftChanged'),
    emit_bottomChanged: event.create('bottomChanged'),
    propertyDescriptors: {
        visible: 'visibleChanged',
        left: 'leftChanged',
        bottom: 'bottomChanged'
    },
    binding: {
        visible: {
            events: 'visibleChanged',
            getter: basis.getter('visible')

        },
        bottom: {
            events: 'bottomChanged',
            getter: basis.getter('bottom')
        },
        left: {
            events: 'leftChanged',
            getter: basis.getter('left')
        },
        content: 'data:'
    },
    setVisible: function(value) {
        value = resolveValue(this, this.setVisible, value, 'visibleRA_');

        if (this.visible !== value) {

            this.visible = value;
            this.emit_visibleChanged();

            if (value) {
                this.sizes = this.element.getBoundingClientRect();
            }
        }
    },
    setLeft: function(value) {
        value = resolveValue(this, this.setLeft, value, 'leftRA_');

        if (this.sizes && value > window.innerWidth - this.sizes.width) {
            value = window.innerWidth - this.sizes.width;
        }

        if (this.left !== value) {
            this.left = value;
            this.emit_leftChanged();
        }
    },
    setBottom: function(value) {
        value = resolveValue(this, this.setBottom, value, 'bottomRA_');

        if (this.bottom !== value) {
            this.bottom = value;
            this.emit_bottomChanged();
        }
    },
    init: function() {
        var visible = this.visible;
        var left = this.left;
        var bottom = this.bottom;

        Node.prototype.init.call(this);

        this.visible = null;
        this.left = null;
        this.bottom = null;
        this.setVisible(visible);
        this.setLeft(left);
        this.setBottom(bottom);
    },
    destroy: function() {
        this.visibleRA_ && resolveValue(this, null, null, 'visibleRA_');
        this.leftRA_ && resolveValue(this, null, null, 'leftRA_');
        this.bottomRA_ && resolveValue(this, null, null, 'bottomRA_');

        Node.prototype.destroy.call(this);
    }
});
