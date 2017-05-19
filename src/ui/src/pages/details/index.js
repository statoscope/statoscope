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
var domEvent = require('basis.dom.event');
var transport = require('app.transport');

var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;
var handleKeyEvent = function(event) {
    if (!currentSuggestion) {
        return;
    }

    if ([KEY_ENTER, KEY_ESCAPE, KEY_UP, KEY_DOWN].indexOf(event.keyCode) == -1) {
        return;
    }

    var selection = currentSuggestion.selection.pick();

    switch (event.keyCode) {
        case KEY_ESCAPE:
            return currentSuggestion.hide();
        case KEY_UP:
            if (!selection) {
                if (currentSuggestion.lastChild) {
                    currentSuggestion.lastChild.select();
                }
            } else if (selection.previousSibling) {
                selection.previousSibling.select()
            } else if (selection.previousSibling != currentSuggestion.lastChild) {
                currentSuggestion.lastChild.select();
            }
            break;
        case KEY_DOWN:
            if (!selection) {
                if (currentSuggestion.firstChild) {
                    currentSuggestion.firstChild.select();
                }
            } else if (selection.nextSibling) {
                selection.nextSibling.select()
            } else if (selection.nextSibling != currentSuggestion.firstChild) {
                currentSuggestion.firstChild.select();
            }
            break;
        case KEY_ENTER:
            if (selection) {
                selection.action.click.call(selection);
            }
            break;
    }

    event.stopPropagation();
    event.die();
};
var currentSuggestion;

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
    handler: {
        open: function() {
            domEvent.addGlobalHandler('keydown', handleKeyEvent);
            this.satellite.content.satellite.filterInput.focus();
        },
        close: function() {
            domEvent.removeGlobalHandler('keydown', handleKeyEvent);
        }
    },
    satellite: {
        content: {
            instance: Node.subclass({
                template: resource('./template/template.tmpl'),
                binding: {
                    filterInput: 'satellite:',
                    modules: 'satellite:',
                    modeSwitcher: 'satellite:',
                    suggestionChoice: Value.query(suggestionChoice, 'target'),
                    modulesCount: Value.query(tableSourceWrapper, 'itemCount'),
                    modulesSize: sum(tableSourceWrapper, 'update', 'data.size').as(utils.formatSize),
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
                            keyup: function(event) {
                                if ([KEY_ENTER, KEY_ESCAPE, KEY_UP, KEY_DOWN].indexOf(event.keyCode) > -1) {
                                    return;
                                }

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
                                        show: function(sender) {
                                            currentSuggestion = sender;
                                        },
                                        hide: function() {
                                            var target = suggestionChoice.target;

                                            currentSuggestion = null;

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
                            tableId: 'DetailedModuleTable',
                            sorting: 'data.index',
                            childClass: TableRow.subclass({
                                template: resource('./template/table/row.tmpl'),
                                binding: {
                                    occurrences: Value.query('data.reasons.itemCount'),

                                    retainedAmount: Value.query('data.retained.itemCount'),
                                    retainedSize: sum(Value.query('data.retained'), 'update', 'data.size')
                                        .as(utils.formatSize),

                                    exclusiveAmount: Value.query('data.exclusive.itemCount'),
                                    exclusiveSize: sum(Value.query('data.exclusive'), 'update', 'data.size')
                                        .as(utils.formatSize),
                                },
                                action: {
                                    gotoModule: function(e) {
                                        var resource = this.data.resource;
                                        var moduleLink;
                                        var position = { line: 1, column: 1 };

                                        e.die();

                                        switch (mode.value) {
                                            case 'require': {
                                                var from = sourceByChoice.value.pick();

                                                resource = from.data.resource;
                                                moduleLink = type.ModuleLink.get({
                                                    from: from.getId(),
                                                    to: this.target.getId()
                                                });
                                                break;
                                            }
                                            case 'occurrences': {
                                                moduleLink = type.ModuleLink.get({
                                                    from: this.target.getId(),
                                                    to: sourceByChoice.value.pick().getId()
                                                });
                                                break;
                                            }
                                        }

                                        if (moduleLink && moduleLink.data.position) {
                                            position = moduleLink.data.position.data
                                        }

                                        if (e.shiftKey && resource) {
                                            if (type.Env.data.connected) {
                                                type.Env.openFile(resource.data.name, { start: position });
                                            } else {
                                                var positionString = ':' + position.line + ':' + position.column;

                                                transport.openInEditor(resource.data.name + positionString);
                                            }
                                        } else {
                                            TableRow.prototype.action.gotoModule.call(this, e);
                                        }
                                    }
                                }
                            }),
                            satellite: {
                                head: TableHead.subclass({
                                    childNodes: [
                                        {
                                            data: { content: dict.token('id') },
                                            columnId: 'id',
                                            sortingRule: 'data.index'
                                        },
                                        {
                                            data: { content: dict.token('name') },
                                            columnId: 'name',
                                            sortingRule: 'data.name'
                                        },
                                        {
                                            data: { content: dict.token('size') },
                                            columnId: 'size',
                                            sortingRule: 'data.size'
                                        },
                                        {
                                            data: { content: dict.token('occurrences') },
                                            columnId: 'occurrences',
                                            sortingRule: 'data.reasons.itemCount'
                                        },
                                        {
                                            data: { content: dict.token('retained') },
                                            columnId: 'retained',
                                            sortingRule: 'data.retained.itemCount'
                                        },
                                        {
                                            data: { content: dict.token('exclusive') },
                                            columnId: 'exclusive',
                                            sortingRule: 'data.exclusive.itemCount'
                                        }
                                    ]
                                }),
                                foot: TableFoot.subclass({
                                    template: resource('./template/table/foot.tmpl')
                                })
                            }
                        })
                    }
                }
            })
        }
    }
});
