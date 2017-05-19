var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var template = require('basis.template');
var Cell = require('../cell/index');

var templates = template.define('app.ui.table.head', {
    head: resource('./template/head.tmpl'),
    cell: resource('./template/cell.tmpl')
});

var LS_KEY_TABLE_SORTING_PREFIX = 'wraTableSorting_';

module.exports = Node.subclass({
    template: templates.head,
    handler: {
        ownerChanged: function() {
            if (this.owner) {
                var savedData = localStorage.getItem(LS_KEY_TABLE_SORTING_PREFIX + this.owner.tableId);

                if (typeof savedData == 'string') {
                    var parts = savedData.split(',');
                    var columnId = parts[0];
                    var sortingDesc = parts[1];

                    for (var i = 0; i < this.childNodes.length; i++) {
                        if (this.childNodes[i].columnId == columnId) {
                            this.owner.setSorting(this.childNodes[i].sortingRule, +sortingDesc);

                            break;
                        }
                    }
                }
            }
        }
    },
    childClass: Cell.subclass({
        template: templates.cell,
        binding: {
            allowSorting: 'sortingRule',
            sortingAsc: function(node) {
                return Value.query(node, 'parentNode.owner').pipe('sortingChanged', function(table) {
                    return node.sortingRule &&
                        basis.getter(node.sortingRule) == basis.getter(table.sorting) &&
                        !table.sortingDesc;
                })
            },
            sortingDesc: function(node) {
                return Value.query(node, 'parentNode.owner').pipe('sortingChanged', function(table) {
                    return node.sortingRule &&
                        basis.getter(node.sortingRule) == basis.getter(table.sorting) &&
                        table.sortingDesc;
                })
            }
        },
        action: {
            click: function() {
                if (this.sortingRule) {
                    var table = this.parentNode.owner;
                    var keyName = LS_KEY_TABLE_SORTING_PREFIX + table.tableId;

                    table.setSorting(this.sortingRule, !table.sortingDesc);
                    localStorage.setItem(keyName, [this.columnId, +table.sortingDesc]);
                }
            }
        }
    })
});
