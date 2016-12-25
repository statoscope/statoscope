var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;

var routes = {
    home: resource('./pages/home/index.js'),
    errors: resource('./pages/errors/index.js'),
    warnings: resource('./pages/warnings/index.js'),
    graph: resource('./pages/graph/index.js'),
    fileMap: resource('./pages/fileMap/index.js')
};

module.exports = require('basis.app').create({
    title: 'Webpack Runtime Analyzer',
    init: function() {
        var webtreeCss = document.createElement('link');

        webtreeCss.setAttribute('rel', 'stylesheet');
        webtreeCss.setAttribute('href', 'https://cdn.rawgit.com/danvk/source-map-explorer/master/vendor/webtreemap.css');

        document.head.appendChild(webtreeCss);

        return new Node({
            active: true,
            template: resource('./template/layout.tmpl'),
            binding: {
                menu: 'satellite:',
                status: resource('./ui/status/index.js'),
                progress: 'satellite:',
                page: 'satellite:'
            },
            satellite: {
                menu: resource('./ui/menu/index.js'),
                progress: resource('./ui/progress/index.js'),
                page: Value.query('satellite.menu.selection.pick()').as(function(node) {
                    return node && routes[node.id] || routes.home;
                })
            }
        });
    }
});
