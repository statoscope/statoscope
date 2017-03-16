var Page = require('app.ui').Page;
var Graph = require('app.ui').Graph;
var ColorBar = require('app.ui').FileColorBar.Bar;
var domEvent = require('basis.dom.event');

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

var KEY_SPACE = 32;
var togglePauseMode = function(event) {
    if (event.keyCode == KEY_SPACE) {
        var isPaused = page.satellite.graph.isPaused;

        isPaused.set(!isPaused.value);
    }
};

var page = new Page({
    className: 'Page.Graph',
    template: resource('./template/page.tmpl'),
    type: 'fit',
    handler: {
        open: function() {
            domEvent.addGlobalHandler('keydown', togglePauseMode);
            this.satellite.graph.isPaused.set(false);

        },
        close: function() {
            domEvent.removeGlobalHandler('keydown', togglePauseMode);
            this.satellite.graph.isPaused.set(true);
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

module.exports = page;
