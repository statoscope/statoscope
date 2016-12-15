var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;

var routes = {
    home: resource('./pages/home/index.js'),
    assets: resource('./pages/assets/index.js'),
    modules: resource('./pages/modules/index.js')
};

module.exports = require('basis.app').create({
    title: '[RemPl] webpack analyzer',
    init: function() {
        var bootsrapCss = document.createElement('link');

        bootsrapCss.setAttribute('rel', 'stylesheet');
        bootsrapCss.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css');

        document.head.appendChild(bootsrapCss);

        return new Node({
            active: true,
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
