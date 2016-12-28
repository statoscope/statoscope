var Node = require('basis.ui').Node;
var DataObject = require('basis.data').Object;
var Dataset = require('basis.data').Dataset;
var wrap = require('basis.data').wrap;
var Value = require('basis.data').Value;
var ColorBar = require('app.ui').ColorBar;
var Graph = require('app.ui').Graph;
var d3 = require('d3');

var colors = d3.schemeCategory10;
var groupsColor = new DataObject({
    data: {
        'unknown': colors[0],
        'js': colors[1],
        'jsx': colors[1],
        'json': colors[1],
        'ts': colors[2],
        'tsx': colors[2],
        'coffee': colors[3],
        'dart': colors[3],
        'css': colors[4],
        'html': colors[5],
        'eot': colors[6],
        'ttf': colors[6],
        'woff': colors[6],
        'woff2': colors[6],
        'svg': colors[7],
        'jpg': colors[7],
        'jpeg': colors[7],
        'png': colors[7],
        'gif': colors[7]
    }
});

module.exports = Node.subclass({
    autoDelegate: true,
    template: resource('./template/page.tmpl'),
    satellite: {
        colorBar: {
            instance: ColorBar.subclass({
                sorting: function(item) {
                    return (item.data.group == 'UNKNOWN') + item.data.group + item.data.count;
                },
                init: function() {
                    ColorBar.prototype.init.call(this);

                    this.setDataSource(new Dataset());
                    Value.query(this, 'data.profile.data.modules').pipe('itemsChanged', function(modules) {
                        if (!modules) {
                            return;
                        }

                        var items = {};

                        modules.forEach(function(module) {
                            var group = module.data.name.split('.').pop();

                            group = groupsColor.data.hasOwnProperty(group) ? group : 'unknown';

                            if (!items[group]) {
                                items[group] = {
                                    count: 0,
                                    width: 0,
                                    group: group.toUpperCase(),
                                    color: groupsColor.data[group]
                                };
                            }

                            items[group].count++;
                        });

                        for (var group in items) {
                            items[group].width = (100 / modules.itemCount * items[group].count).toFixed(2);
                        }

                        this.dataSource.set(wrap(basis.object.values(items), true));
                    }.bind(this));
                }
            })
        },
        graph: {
            instance: Graph.subclass({
                groupsColor: groupsColor
            }),
            delegate: 'graph'
        }
    },
    binding: {
        colorBar: 'satellite:',
        graph: 'satellite:'
    },
    init: function() {
        Node.prototype.init.call(this);

        this.graph = Value.query(this, 'target.data.profile.data.modules').pipe('itemsChanged', function(modules) {
            if (!modules) {
                return;
            }

            var nodes = [];
            var links = [];

            modules.forEach(function(module) {
                var group = module.data.name.split('.').pop();

                // todo add error/warning count
                nodes.push({ id: module.data.id, name: module.data.name, group: group, main: !module.data.reasons.itemCount });
                module.data.reasons.forEach(function(reason) {
                    links.push({ source: reason.data.id, target: module.data.id });
                });
            });

            return new DataObject({
                data: {
                    nodes: nodes,
                    links: links
                }
            });
        });
    },
    destroy: function() {
        this.graph.destroy();
        this.graph = null;

        Node.prototype.destroy.call(this);
    }
});
