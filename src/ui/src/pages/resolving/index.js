var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var Tooltip = require('app.ui').Tooltip;
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
                    dataSource: Value.query('data.resolving'),
                    binding: {
                        rawRequest: 'data:',
                        visible: 'visible'
                    },
                    action: {
                        click: function() {
                            this.visible.set(!this.visible.value);
                        }
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
                    },
                    init: function() {
                        this.visible = new Value({ value: false });
                        Node.prototype.init.call(this);
                    },
                    destroy: function() {
                        this.visible.destroy();
                        this.visible = null;
                        Node.prototype.destroy.call(this);
                    }
                }
            })
        }
    }
});
