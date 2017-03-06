var Page = require('app.ui').Page;
var Graph = require('app.ui').Graph;
var ColorBar = require('app.ui').FileColorBar.Bar;

var typeByExt = {
    '.js': 'script',
    '.jsx': 'script',
    '.es6': 'script',
    '.ts': 'script',
    '.tsx': 'script',
    '.coffee': 'script',
    '.dart': 'script',
    '.json': 'json',
    '.css': 'style',
    '.html': 'html',
    '.eot': 'font',
    '.ttf': 'font',
    '.woff': 'font',
    '.woff2': 'font',
    '.svg': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.tmpl': 'template',
    '.l10n': 'l10n'
};

var typeOrder = [
    'html',
    'script',
    'style',
    'template',
    'l10n',
    'image',
    'json',
    'font',
    'unknown'
];

function getTypeByExt(ext) {
    return typeByExt.hasOwnProperty(ext) ? typeByExt[ext] : 'unknown';
}

module.exports = new Page({
    className: 'Page.Graph',
    template: resource('./template/page.tmpl'),
    type: 'fit',
    handler: {
        open: function() {
            this.satellite.graph.start();
        },
        close: function() {
            this.satellite.graph.stop();
        }
    },
    satellite: {
        colorBar: {
            instance: new ColorBar({
                getTypeByExt: getTypeByExt,
                sorting: function(item) {
                    var index = typeOrder.indexOf(item.data.type);

                    return index !== -1 ? index : Infinity;
                }
            })
        },
        graph: Graph
    },
    binding: {
        colorBar: 'satellite:',
        graph: 'satellite:'
    }
});
