var Page = require('app.ui').Page;
var Graph = require('app.ui.newGraph.index');
var ColorBar = require('app.ui').ColorBar;
var Node = require('basis.ui').Node;
var Vector = require('basis.data.vector').Vector;
var vectorCount = require('basis.data.vector').count;
var IndexMap = require('basis.data.index').IndexMap;
var sum = require('basis.data.index').sum;
var type = require('app.type');

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
    type: 'fit',
    satellite: {
        content: new Node({
            template: resource('./template/page.tmpl'),
            satellite: {
                colorBar: {
                    instance: ColorBar.subclass({
                        sorting: function(item) {
                            var index = typeOrder.indexOf(item.data.type);

                            return index !== -1 ? index : Infinity;
                        },
                        dataSource: function() {
                            return new IndexMap({
                                source: new Vector({
                                    source: type.Module.files,
                                    rule: function(file) {
                                        return getTypeByExt(file.data.extname);
                                    },
                                    calcs: {
                                        count: vectorCount()
                                    }
                                }),
                                indexes: {
                                    totalCount: sum('data.count')
                                },
                                calcs: {
                                    percentage: function(data, indexes) {
                                        return 100 * data.count / indexes.totalCount;
                                    },
                                    type: function(data, indexes, sourceObject) {
                                        return sourceObject.key;
                                    },
                                    caption: function(data, indexes, sourceObject) {
                                        return sourceObject.key;
                                    }
                                }
                            });
                        },
                        childClass: {
                            template: resource('./template/color-bar-item.tmpl')
                        },
                        tooltipClass: ColorBar.prototype.tooltipClass.subclass({
                            template: resource('./template/color-bar-tooltip.tmpl')
                        })
                    })
                },
                graph: new Graph()
            },
            binding: {
                colorBar: 'satellite:',
                graph: 'satellite:'
            }
        })
    }
});
