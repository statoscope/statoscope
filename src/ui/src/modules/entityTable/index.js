var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var sum = require('basis.data.index').sum;

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
    active: true,
    template: resource('./template/list.tmpl'),
    binding: {
        totalSize: Value.query('<static>totalSize.value').as(function(size) {
            return basis.number.format(getSize(size), 2);
        }),
        postfix: Value.query('<static>totalSize.value').as(getPostfix)
    },
    childClass: {
        template: resource('./template/item.tmpl'),
        binding: {
            name: 'name',
            size: function(node) {
                return basis.number.format(getSize(node.size), 2);
            },
            postfix: function(node) {
                return getPostfix(node.size);
            }
        }
    },
    init: function() {
        Node.prototype.init.call(this);
        this.totalSize = sum(this.getChildNodesDataset(), 'update', 'size');
    },
    destroy: function() {
        this.totalSize.destroy();
        this.totalSize = null;
        Node.prototype.destroy.call(this);
    }
});
