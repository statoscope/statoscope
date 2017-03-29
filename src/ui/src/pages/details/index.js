var entity = require('basis.entity');
var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var DataObject = require('basis.data').Object;
var Dataset = require('basis.data').Dataset;
var DatasetWrapper = require('basis.data').DatasetWrapper;
var MapFilter = require('basis.data.dataset').MapFilter;
var Merge = require('basis.data.dataset').Merge;
var Page = require('app.ui').Page;
var type = require('app.type');
var TextInput = require('app.ui').TextInput;
var Switcher = require('app.ui.switcher').Switcher;
var Popup = require('basis.ui.popup').Popup;
var utils = require('app.utils');
var ModulesTable = require('app.ui.modulesTable').Table;
var TableHead = require('app.ui.modulesTable').Head;
var TableRow = require('app.ui.modulesTable').Row;
var TableFoot = require('app.ui.modulesTable').Foot;
var sum = require('basis.data.index').sum;
var dict = require('basis.l10n').dictionary(__filename);

// require, occurrences, retained, exclusive
var mode = new Value({ value: 'require' });
var typeMap = {
    Module: 'module',
    File: 'file'
};
var suggestSource = new MapFilter({
    source: new Merge({
        sources: [type.Module.allWrapper, type.Module.files]
    }),
    map: function(item) {
        return new DataObject({
            data: {
                id: item.target.getId(),
                type: typeMap[item.target.typeName],
                name: item.data[item.target.typeName == 'File' ? 'short' : 'name'],
                typeName: item.target.typeName
            }
        });
    }
});

var suggestionChoice = require('./target');
var sourceByChoice = Value.query(suggestionChoice, 'target').as(function(target) {
    if (!target) {
        return type.Module.allWrapper;
    }

    switch (typeMap[target.typeName]) {
        case 'module':
            return new Dataset({
                items: [target]
            });
        case 'file':
            return new DatasetWrapper({
                dataset: Value.query(type.FileLink.getSlot(target.data.name), 'data.modules')
            });
    }
});

var required = sourceByChoice.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.dependencies');
});
var occurrences = sourceByChoice.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.reasons');
});
var retained = sourceByChoice.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.retained');
});
var exclusive = sourceByChoice.as(function(dataSource) {
    return utils.mergeFromDataSource(dataSource, 'data.exclusive');
});

var tableSource = mode.as(function(mode) {
    switch (mode) {
        case 'require':
            return required;
        case 'occurrences':
            return occurrences;
        case 'retained':
            return retained;
        case 'exclusive':
            return exclusive;
    }
});

var tableSourceWrapper = new Merge({
    sources: [tableSource, type.Module.allWrapper],
    rule: Merge.INTERSECTION
});

module.exports = new Page({
    className: 'Page.Env',
    satellite: {
        content: {
            instance: Node.subclass({
                template: resource('./template/template.tmpl'),
                binding: {
                    filterInput: 'satellite:',
                    modules: 'satellite:',
                    modeSwitcher: 'satellite:',
                    suggestionChoice: Value.query(suggestionChoice, 'target')
                },
                satellite: {
                    filterInput: TextInput.subclass({
                        template: resource('./template/textInput.tmpl'),
                        binding: {
                            type: Value.query(suggestionChoice, 'target').as(function(target) {
                                if (target) {
                                    return typeMap[target.typeName];
                                }
                            })
                        },
                        action: {
                            keyup: function() {
                                if (this.value.trim() && this.value.length >= 3) {
                                    this.satellite.suggestion.show(this.tmpl.element);
                                    suggestSource.applyRule();
                                } else {
                                    suggestionChoice.setDelegate(null);
                                    this.satellite.suggestion.hide();
                                }
                            }
                        },
                        satellite: {
                            suggestion: {
                                instance: Popup.subclass({
                                    template: resource('./template/suggestion/list.tmpl'),
                                    dir: 'left bottom left top',
                                    dataSource: suggestSource,
                                    selection: true,
                                    sorting: function(node) {
                                        return node.data.name + node.data.type;
                                    },
                                    childClass: {
                                        template: resource('./template/suggestion/item.tmpl'),
                                        binding: {
                                            name: 'data:',
                                            type: 'data:'
                                        },
                                        action: {
                                            click: function() {
                                                var type = entity.getTypeByName(this.data.typeName);

                                                suggestionChoice.setDelegate(type(this.data.id));
                                                this.parentNode.hide();

                                                /** @cut */ basis.dev.log(suggestionChoice)
                                            }
                                        }
                                    },
                                    handler: {
                                        hide: function() {
                                            var target = suggestionChoice.target;

                                            if (target) {
                                                this.owner.setValue(target.data.short || target.data.name);
                                            } else {
                                                this.owner.setValue('');
                                            }
                                        }
                                    }
                                })
                            }
                        },
                        init: function() {
                            TextInput.prototype.init.call(this);
                            suggestSource.setFilter(function(node) {
                                return !(node.data.name.toLowerCase().indexOf(this.value.toLowerCase()) > -1);
                            }.bind(this));
                            Value.query(suggestionChoice, 'target').link(this, function(target) {
                                if (target) {
                                    this.setValue(target.data.short || target.data.name);
                                } else {
                                    this.setValue('');
                                }
                            });
                        }
                    }),
                    modeSwitcher: Switcher.subclass({
                        childClass: {
                            selected: mode.compute('change', function(node, value) {
                                return node.mode == value;
                            }),
                            action: {
                                select: function() {
                                    mode.set(this.mode);
                                }
                            }
                        },
                        childNodes: [
                            { mode: 'require', title: 'Require' },
                            { mode: 'occurrences', title: 'Occurrences' },
                            { mode: 'retained', title: 'Retained' },
                            { mode: 'exclusive', title: 'Exclusive' }
                        ]
                    }),
                    modules: {
                        dataSource: tableSourceWrapper,
                        instance: ModulesTable.subclass({
                            childClass: TableRow.subclass({
                                template: resource('./template/table/row.tmpl'),
                                binding: {
                                    occurrences: Value.query('data.reasons.itemCount'),

                                    retainedAmount: Value.query('data.retained.itemCount'),
                                    retainedSize: sum(Value.query('data.retained'), 'update', 'data.size')
                                        .as(function(size) {
                                            return utils.roundSize(size) + ' ' + utils.getPostfix(size);
                                        }),

                                    exclusiveAmount: Value.query('data.exclusive.itemCount'),
                                    exclusiveSize: sum(Value.query('data.exclusive'), 'update', 'data.size')
                                        .as(function(size) {
                                            return utils.roundSize(size) + ' ' + utils.getPostfix(size);
                                        }),
                                }
                            }),
                            satellite: {
                                head: TableHead.subclass({
                                    childNodes: [
                                        { data: { content: dict.token('id') } },
                                        { data: { content: dict.token('name') } },
                                        { data: { content: dict.token('size') } },
                                        { data: { content: dict.token('occurrences') } },
                                        { data: { content: dict.token('retained') } },
                                        { data: { content: dict.token('exclusive') } }
                                    ]
                                }),
                                foot: TableFoot.subclass({
                                    template: resource('./template/table/foot.tmpl')
                                })
                            }
                        })
                    }
                },
                init: function() {
                    Node.prototype.init.call(this);
                }
            })
        }
    }
});
