var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var events = require('basis.event');
var resolveValue = require('basis.data').resolveValue;

function getSize(bytes) {
    var kBytes = bytes / 1024;
    var mBytes = bytes / 1024 / 1024;

    if (mBytes >= 1) {
        return mBytes;
    } else if (kBytes >= 1) {
        return kBytes;
    }

    return bytes;
}

function getPostfix(bytes) {
    var kBytes = bytes / 1024;
    var mBytes = bytes / 1024 / 1024;

    if (mBytes >= 1) {
        return 'MB';
    } else if (kBytes >= 1) {
        return 'KB';
    }

    return 'B';
}

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
                return basis.number.format(getSize(size || 0), 2);
            }
        }),
        postfix: Value.query('size').as(getPostfix)
    },
    init: function() {
        Node.prototype.init.call(this);

        this.setSize(this.size);
    }
});
