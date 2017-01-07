var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var Tooltip = require('app.ui').Tooltip;
var Overlay = require('app.ui').Overlay;
var type = require('app.type');
var utils = require('app.utils');

var tooltip = new Tooltip({
    template: resource('./template/resolving/tooltip.tmpl'),
    binding: {
        context: function(node) {
            return utils.trimContextExpression(Value.query(node, 'data.context'));
        },
        target: function(node) {
            return utils.trimContextExpression(Value.query(node, 'data.target'));
        },
        type: 'data:'
    }
});

var overlay = new Overlay({
    template: resource('./template/require/overlay.tmpl'),
    dataSource: Value.query('data.resolving'),
    binding: {
        rawRequest: 'data:'
    },
    childClass: {
        template: resource('./template/resolving/list.tmpl'),
        dataSource: Value.query('data.stack'),
        binding: {
            target: function(node) {
                return utils.trimContextExpression(Value.query(node, 'data.target'));
            }
        },
        childClass: {
            template: resource('./template/resolving/item.tmpl'),
            action: {
                mouseOver: function() {
                    tooltip.setDelegate(this);
                },
                mouseMove: function(event) {
                    tooltip.setBottom(window.innerHeight - event.pageY + 10);
                    tooltip.setLeft(event.pageX - 10);
                },
                mouseOut: function() {
                    tooltip.setDelegate(null);
                }
            }
        }
    }
});

module.exports = new Page({
    delegate: Value.query('owner').as(function(owner) {
        return owner ? type.Source : null;
    }),
    satellite: {
        content: {
            instance: Node.subclass({
                autoDelegate: true,
                template: resource('./template/list.tmpl'),
                dataSource: Value.query('data.profile.data.modules'),
                childClass: {
                    template: resource('./template/require/list.tmpl'),
                    binding: {
                        rawRequest: 'data:'
                    },
                    action: {
                        click: function() {
                            overlay.setDelegate(this);
                        }
                    }
                }
            })
        }
    }
});
