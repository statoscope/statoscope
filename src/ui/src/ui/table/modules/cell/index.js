var Value = require('basis.ui').Value;
var Node = require('basis.ui').Node;
var template = require('basis.template');

var templates = template.define('app.ui.table', {
    cell: resource('./template/cell.tmpl')
});

module.exports = Node.subclass({
    template: templates.cell,
    data: {
        content: ''
    },
    binding: {
        content: 'data:'
    },
    init: function() {
        if (this.columnId == undefined) {
            this.addHandler({
                parentChanged: function() {
                    if (this.parentNode) {
                        var id = 0;
                        var cursor = this.previousSibling;

                        while (cursor) {
                            cursor = cursor.previousSibling;
                            id++;
                        }

                        this.columnId = id;
                    }
                }
            });
        }

        Node.prototype.init.call(this);
    }
});
