var Value = require('basis.data').Value;
var resolveValue = require('basis.data').resolveValue;
var event = require('basis.event');
var Node = require('basis.ui').Node;
var Popup = require('basis.ui.popup').Popup;

var Menu = Node.subclass({
    template: resource('./template/menu.tmpl'),
    selection: true,
    childFactory: function(config) {
        return new MenuItem(config);
    },
    binding: {
        footer: 'satellite:'
    }
});

var MenuItem = Node.subclass({
    template: resource('./template/item.tmpl'),
    type: 'normal',
    typeRA_: null,
    checked: false,
    checkedRA_: null,
    emit_typeChanged: event.create('typeChanged'),
    emit_checkedChanged: event.create('checkedChanged'),
    propertyDescriptors: {
        type: 'typeChanged',
        checked: 'checkedChanged'
    },
    action: {
        click: function(e) {
            switch (this.type) {
                case 'dropdown':
                    this.satellite.dropdown.show(this.element);
                    break;
                case 'checkbox':
                    this.setChecked(!this.checked);
                    this.toggle(e);
                    break;
                default:
                    this.select();
            }
        }
    },
    satellite: {
        dropdown: {
            instance: Popup.subclass({
                template: resource('./template/popup.tmpl'),
                dir: 'left bottom left top',
                autorotate: true,
                hideOnKey: basis.fn.$true,
                satellite: {
                    menu: {
                        instance: Menu,
                        config: function(owner) {
                            return {
                                template: resource('./template/sub-menu.tmpl'),
                                childNodes: owner.items
                            };
                        }
                    }
                },
                binding: {
                    menu: 'satellite:'
                }
            }),
            existsIf: function(owner) {
                return owner.type == 'dropdown'
            },
            config: function(owner) {
                return {
                    items: owner.items
                };
            }
        }
    },
    binding: {
        id: 'id',
        isCheckbox: function(node) {
            return node.type == 'checkbox';
        },
        type: {
            events: 'typeChanged',
            getter: basis.getter('type')
        },
        checked: {
            events: 'checkedChanged',
            getter: basis.getter('checked')
        },
        subMenuOpened: Value.query('satellite.dropdown.visible')
    },
    init: function() {
        var type = this.type;
        var checked = this.checked;

        Node.prototype.init.call(this);

        this.setType(type);
        this.setChecked(checked);
    },
    toggle: basis.fn.$undef,
    setType: function(value) {
        value = resolveValue(this, this.setType, value, 'typeRA_');

        if (this.type !== value) {
            this.type = value;
            this.emit_typeChanged();
        }
    },
    setChecked: function(value) {
        value = resolveValue(this, this.setChecked, value, 'checkedRA_');

        if (this.checked !== value) {
            this.checked = value;
            this.emit_checkedChanged();
        }
    },
    destroy: function() {
        this.typeRA_ && resolveValue(this, null, null, 'typeRA_');
        this.checkedRA_ && resolveValue(this, null, null, 'checkedRA_');
        Node.prototype.destroy.call(this);
    }
});

module.exports = {
    Menu: Menu,
    MenuItem: MenuItem
};
