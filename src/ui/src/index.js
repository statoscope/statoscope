var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;
var Menu = require('app.ui.menu').Menu;
var type = require('app.type');

var routes = {
    home: resource('./pages/home/index.js'),
    errors: resource('./pages/errors/index.js'),
    warnings: resource('./pages/warnings/index.js'),
    graph: resource('./pages/graph/index.js'),
    fileMap: resource('./pages/fileMap/index.js')
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
                status: resource('./ui/status/index.js'),
                progress: 'satellite:',
                page: 'satellite:'
            },
            satellite: {
                menu: Menu.subclass({
                    childNodes: [
                        { id: 'home', selected: true },
                        { id: 'errors', binding: { counter: Value.query(type.Error.all, 'itemCount') } },
                        { id: 'warnings', binding: { counter: Value.query(type.Warning.all, 'itemCount') } },
                        { id: 'graph' },
                        { id: 'fileMap' },
                        {
                            id: 'options',
                            type: 'dropdown',
                            items: [
                                {
                                    id: 'hide-non-project',
                                    type: 'checkbox',
                                    checked: type.Module.hideNonProjectModules,
                                    toggle: function() {
                                        type.Module.hideNonProjectModules.set(this.checked);
                                    }
                                }
                            ]
                        }
                    ],
                    satellite: {
                        footer: Node.subclass({
                            template: resource('./template/menu-footer.tmpl'),
                            binding: {
                                homepage: homepage,
                                version: version
                            }
                        })
                    }
                }),
                progress: resource('./ui/progress/index.js'),
                page: Value.query('satellite.menu.selection.pick()').as(function(node) {
                    return node && routes[node.id] || routes.home;
                })
            }
        });
    }
});
