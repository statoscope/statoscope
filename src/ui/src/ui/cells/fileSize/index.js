var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var events = require('basis.event');
var resolveValue = require('basis.data').resolveValue;
var utils = require('app.utils');

module.exports = Node.subclass({
    template: resource('./template/cell.tmpl'),
    propertyDescriptors: {
        size: 'sizeChanged'
    },
    size: 0,
    sizeRA_: null,
    emit_sizeChanged: events.create('sizeChanged'),
    setSize: function(value) {
        value = resolveValue(this, this.setSize, value, 'sizeRA_');

        if (this.size !== value) {
            this.size = value;
            this.emit_sizeChanged();
        }
    },
    binding: {
        size: Value.query('size').as(function(size) {
            if (!isNaN(size)) {
                switch (utils.getPostfix(size)) {
                    case 'bytes':
                        return size;
                    case 'KB':
                        return Math.round(utils.getSize(size));
                    case 'MB':
                        return utils.getSize(size).toFixed(2);
                }
            }
        }),
        postfix: Value.query('size').as(utils.getPostfix)
    },
    init: function() {
        Node.prototype.init.call(this);

        this.setSize(this.size);
    }
});
