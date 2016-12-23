var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;

var routes = {
    home: resource('./pages/home/index.js'),
    errors: resource('./pages/errors/index.js'),
    warnings: resource('./pages/warnings/index.js'),
    fileMap: resource('./pages/fileMap/index.js')
};

module.exports = require('basis.app').create({
    title: 'Webpack Runtime Analyzer',
    init: function() {
        var bootsrapCss = document.createElement('link');
        var webtreeCss = document.createElement('link');

        bootsrapCss.setAttribute('rel', 'stylesheet');
        bootsrapCss.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css');

        webtreeCss.setAttribute('rel', 'stylesheet');
        webtreeCss.setAttribute('href', 'https://cdn.rawgit.com/danvk/source-map-explorer/master/vendor/webtreemap.css');

        document.head.appendChild(bootsrapCss);
        document.head.appendChild(webtreeCss);

        return new Node({
            template: resource('./template/layout.tmpl'),
            satellite: {
                menu: resource('./ui/menu/index.js'),
                progress: resource('./ui/progress/index.js'),
                page: {
                    instance: Value.query('satellite.menu.selection.pick()').as(function(node) {
                        return node && routes[node.id] || routes.home;
                    })
                }
            },
            binding: {
                menu: 'satellite:',
                progress: 'satellite:',
                page: 'satellite:'
            }
        });
    }
});
