var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;
var Progress = require('app.ui').Progress;
var Status = require('app.ui').Status;
var Menu = require('app.ui.menu').Menu;
var type = require('app.type');

var routes = {
    home: resource('./pages/home/index.js'),
    errors: resource('./pages/errors/index.js'),
    warnings: resource('./pages/warnings/index.js'),
    graph: resource('./pages/graph/index.js'),
    fileMap: resource('./pages/fileMap/index.js'),
    env: resource('./pages/env/index.js')
};

var version = new basis.Token(require('../../../package.json').version);
var homepage = new basis.Token(require('../../../package.json').homepage);

module.exports = require('basis.app').create({
    title: 'Webpack Runtime Analyzer',
    init: function() {
        var wTreeCss = document.createElement('link');

        wTreeCss.setAttribute('rel', 'stylesheet');
        wTreeCss.setAttribute('href', 'https://cdn.rawgit.com/danvk/source-map-explorer/master/vendor/webtreemap.css');

        document.head.appendChild(wTreeCss);

        return new Node({
            template: resource('./template/layout.tmpl'),
            binding: {
                menu: 'satellite:',
                status: new Status(),
                progress: 'satellite:',
                page: 'satellite:'
            },
            satellite: {
                menu: new Menu({
                    childNodes: [
                        { id: 'home', selected: true },
                        { id: 'errors', counter: Value.query(type.Error.all, 'itemCount') },
                        { id: 'warnings', counter: Value.query(type.Warning.all, 'itemCount') },
                        { id: 'graph' },
                        { id: 'fileMap' },
                        { id: 'env', visible: Value.query(type.Env, 'data.name') },
                        {
                            id: 'options',
                            type: 'dropdown',
                            items: [
                                {
                                    id: 'hide-3rd-party',
                                    type: 'checkbox',
                                    checked: type.Module.hide3rdPartyModules,
                                    toggle: function() {
                                        type.Module.hide3rdPartyModules.set(this.checked);
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
                    }
                }),
                progress: new Progress(),
                page: Value.query('satellite.menu.selection.pick()').as(function(node) {
                    return node && routes[node.id] || routes.home;
                })
            }
        });
    }
});
