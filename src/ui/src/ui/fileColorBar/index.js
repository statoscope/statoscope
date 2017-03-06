var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Tooltip = require('app.ui.tooltip.index');
var Vector = require('basis.data.vector').Vector;
var vectorCount = require('basis.data.vector').count;
var IndexMap = require('basis.data.index').IndexMap;
var sum = require('basis.data.index').sum;
var ColorBar = require('../colorBar/index').Bar;
var ColorBarItem = require('../colorBar/index').Item;
var type = require('app.type');
var template = require('basis.template');

var templates = template.define('app.ui.fileColorBar', {
    bar: template.get('app.ui.colorBar.bar'),
    item: resource('./template/item.tmpl'),
    tooltip: resource('./template/tooltip.tmpl')
});

var FileColorBar = ColorBar.subclass({
    tooltipClass: Tooltip.subclass({
        template: templates.tooltip,
        binding: {
            type: 'data:',
            caption: 'data:',
            count: 'data:',
            percentage: {
                events: 'update',
                getter: function(node) {
                    return Number(node.data.percentage).toFixed(2);
                }
            }
        }
    }),
    dataSource: function() {
        var that = this;

        return new IndexMap({
            source: new Vector({
                source: type.Module.files,
                rule: function(file) {
                    return that.getTypeByExt(file.data.extname);
                },
                calcs: {
                    count: vectorCount()
                }
            }),
            indexes: {
                totalCount: sum('data.count')
            },
            calcs: {
                percentage: function(data, indexes) {
                    return 100 * data.count / indexes.totalCount;
                },
                type: function(data, indexes, sourceObject) {
                    return sourceObject.key;
                },
                caption: function(data, indexes, sourceObject) {
                    return sourceObject.key;
                }
            }
        });
    },
    childClass: ColorBarItem.subclass({
        template: templates.item,
        binding: {
            type: 'data:'
        },
        action: {
            mouseMove: function(event) {
                this.parentNode.tooltip.setBottom(window.innerHeight - event.pageY + 10);
                this.parentNode.tooltip.setLeft(event.pageX - 10);
            },
            unselect: function() {
                this.unselect();
            }
        }
    }),
    init: function() {
        Node.prototype.init.call(this);

        this.tooltip = new this.tooltipClass({
            delegate: Value.query(this, 'selection.pick()')
        });
    },
    destroy: function() {
        this.tooltip.destroy();
        this.tooltip = null;
        Node.prototype.destroy.call(this);
    }
});

module.exports = {
    Bar: FileColorBar,
    item: ColorBarItem
};
