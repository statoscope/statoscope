rempl.getSubscriber(function(api) {
    var transport = require('./transport');

    transport.api = api;

    var Value = require('basis.data').Value;
    var Node = require('basis.ui').Node;
    var Progress = require('app.ui').Progress;
    var Status = require('app.ui').Status;
    var BottomBar = require('app.ui').BottomBar;
    var Menu = require('app.ui.menu').Menu;
    var type = require('app.type');
    var pageSwitcher = require('app.pageSwitcher');
    var detailTarget = require('app.pages.details.target');
    var sum = require('basis.data.index').sum;
    var utils = require('app.utils');
    var options = require('./options');

    var routes = {
        home: resource('./pages/home/index.js'),
        errors: resource('./pages/errors/index.js'),
        warnings: resource('./pages/warnings/index.js'),
        graph: resource('./pages/graph/index.js'),
        fileMap: resource('./pages/fileMap/index.js'),
        details: resource('./pages/details/index.js')
    };

    var version = new basis.Token(require('../../../package.json').version);
    var homepage = new basis.Token(require('../../../package.json').homepage);

    module.exports = require('basis.app').create({
        title: 'Webpack Runtime Analyzer',
        init: function() {
            return new Node({
                template: resource('./template/layout.tmpl'),
                binding: {
                    menu: 'satellite:',
                    status: new Status(),
                    progress: 'satellite:',
                    page: 'satellite:',
                    bottom: 'satellite:'
                },
                satellite: {
                    menu: new Menu({
                        childNodes: [
                            { id: 'home', selected: true },
                            { id: 'errors', counter: Value.query(type.Error.all, 'itemCount') },
                            { id: 'warnings', counter: Value.query(type.Warning.all, 'itemCount') },
                            { id: 'graph' },
                            { id: 'fileMap' },
                            { id: 'details' },
                            {
                                id: 'options',
                                type: 'dropdown',
                                items: [
                                    {
                                        id: 'hide-3rd-party',
                                        type: 'checkbox',
                                        checked: options.hide3rdPartyModules,
                                        toggle: function() {
                                            options.hide3rdPartyModules.set(this.checked);
                                        }
                                    }
                                ]
                            }
                        ],
                        satellite: {
                            footer: new Node({
                                template: resource('./template/menu-footer.tmpl'),
                                binding: {
                                    homepage: homepage,
                                    version: version
                                }
                            })
                        },
                        init: function() {
                            Menu.prototype.init.call(this);
                            pageSwitcher.link(this, function(page) {
                                if (page) {
                                    var find = basis.array.search(this.childNodes, page, 'id');

                                    if (find) {
                                        find.action.click.call(find);
                                    }

                                    pageSwitcher.set(null);
                                }
                            });
                        }
                    }),
                    progress: new Progress(),
                    page: Value.query('satellite.menu.selection.pick()').as(function(node) {
                        return node && routes[node.id] || routes.home;
                    }),
                    bottom: {
                        existsIf: Value.query(type.Env, 'data.connected'),
                        delegate: Value.query(type.Env, 'data.file'),
                        instance: BottomBar.subclass({
                            template: resource('./template/bottom.tmpl'),
                            binding: {
                                fileName: Value.query(type.Env, 'data.file.data.short'),
                                fileSize: Value.query(type.Env, 'data.file.data.formattedSize'),
                                outputAmount: Value.query(type.Env, 'data.modules.itemCount'),
                                outputSize: sum(Value.query(type.Env, 'data.modules'), 'update', 'data.size')
                                    .as(function(size) {
                                        return utils.roundSize(size) + ' ' + utils.getPostfix(size);
                                    }),
                                requiredAmount: type.Env.requiredAmount,
                                requiredSize: type.Env.requiredFormattedSize,
                                retainedAmount: type.Env.retainedAmount,
                                retainedSize: type.Env.retainedFormattedSize,
                                exclusiveAmount: type.Env.exclusiveAmount,
                                exclusiveSize: type.Env.exclusiveFormattedSize
                            },
                            action: {
                                fileStat: function() {
                                    detailTarget.setDelegate(this.target);
                                    pageSwitcher.set('details');
                                }
                            }
                        })
                    }
                }
            });
        }
    });
});
