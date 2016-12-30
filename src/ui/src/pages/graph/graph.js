var Node = require('basis.ui').Node;
var Dataset = require('basis.data').Dataset;
var wrap = require('basis.data').wrap;
var Value = require('basis.data').Value;
var addHandler = require('basis.dom.event').addHandler;
var removeHandler = require('basis.dom.event').removeHandler;
var Module = require('app.type').Module;
var Tooltip = require('app.ui').Tooltip;
var ColorBar = require('app.ui').ColorBar;
var Graph = require('app.ui').Graph;
var d3 = require('d3');

var colors = d3.schemeCategory10;
var groupsColor = {
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
};

function onResizeHandler() {
    var sizes = this.element.getBoundingClientRect();

    this.setWidth(window.innerWidth - sizes.left - this.marginRight + 'px');
    this.setHeight(window.innerHeight - sizes.top - this.marginBottom + 'px');
}

module.exports = Node.subclass({
    autoDelegate: true,
    template: resource('./template/page.tmpl'),
    satellite: {
        colorBar: {
            instance: ColorBar.subclass({
                autoDelegate: true,
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

                            group = groupsColor.hasOwnProperty(group) ? group : 'unknown';

                            if (!items[group]) {
                                items[group] = {
                                    count: 0,
                                    width: 0,
                                    group: group.toUpperCase(),
                                    color: groupsColor[group]
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
                marginBottom: 10,
                marginRight: 10,
                extendNodes: function(svg, simulation, newNodes, newLinks) {
                    var tooltip = this.tooltip;
                    var isDragging = false;

                    // todo highlight links, draw arrows
                    newNodes.call(d3.drag()
                        .on('start', dragStart)
                        .on('drag', dragging)
                        .on('end', dragEnd))
                        .on('mousemove', function(sender) {
                            if (!isDragging) {
                                tooltip.setDelegate(Module(sender.id));
                                tooltip.setBottom(window.innerHeight - d3.event.pageY + 10);
                                tooltip.setLeft(d3.event.pageX - 10);
                            }
                        })
                        .on('mouseout', function() {
                            tooltip.setDelegate(null);
                        });

                    newLinks
                        .attr('stroke', '#999')
                        .attr('stroke-opacity', '0.6');

                    this.svg
                        .select('g.nodes')
                        .selectAll('circle')
                        .attr('r', 5)
                        .attr('stroke-width', function(d) {
                            return d.main ? '2.5px' : '1.5px';
                        })
                        .attr('stroke', function(d) {
                            return d.main ? '#d62728' : '#fff';
                        })
                        .attr('fill', function(d) {
                            return groupsColor.hasOwnProperty(d.group) ? groupsColor[d.group] : groupsColor.unknown;
                        });

                    function dragStart(d) {
                        if (!d3.event.active) {
                            simulation.alphaTarget(0.5).restart();
                        }

                        d.fx = d.x;
                        d.fy = d.y;
                        isDragging = true;
                        tooltip.setDelegate(null);
                    }

                    function dragging(d) {
                        d.fx = d3.event.x;
                        d.fy = d3.event.y;
                    }

                    function dragEnd(d) {
                        if (!d3.event.active) {
                            simulation.alphaTarget(0);
                        }

                        d.fx = null;
                        d.fy = null;
                        isDragging = false;
                    }
                },
                applySimulation: function(svg, simulation, graph) {
                    var sizes = this.svg.node().getBoundingClientRect();

                    simulation
                        .nodes(graph.nodes)
                        .force('center', d3.forceCenter(sizes.width / 2, sizes.height / 2))
                        .force('link', d3.forceLink(graph.links).id(basis.getter('id')))
                        .force('charge', d3.forceManyBody().distanceMax(400))
                        .on('tick', tick)
                        .alphaTarget(1).restart();

                    function tick() {
                        svg.selectAll('g.links line')
                            .attr('x1', function(d) {
                                return d.source.x;
                            })
                            .attr('y1', function(d) {
                                return d.source.y;
                            })
                            .attr('x2', function(d) {
                                return d.target.x;
                            })
                            .attr('y2', function(d) {
                                return d.target.y;
                            });

                        svg.selectAll('g.nodes circle')
                            .attr('cx', function(d) {
                                return d.x;
                            })
                            .attr('cy', function(d) {
                                return d.y;
                            });
                    }
                },
                init: function() {
                    this.tooltip = new Tooltip({
                        template: resource('./template/graph-tooltip.tmpl'),
                        binding: {
                            color: Value.query('data.name').as(function(name) {
                                var group = (name || '').split('.').pop();

                                return groupsColor.hasOwnProperty(group) ? groupsColor[group] : groupsColor.unknown;
                            }),
                            isEntry: Value.query('data.reasons.itemCount').as(basis.bool.invert),
                            name: 'data:'
                        }
                    });

                    Graph.prototype.init.call(this);
                },
                postInit: function() {
                    Graph.prototype.postInit.call(this);

                    addHandler(window, 'resize', onResizeHandler, this);
                    onResizeHandler.call(this);
                },
                destroy: function() {
                    removeHandler(window, 'resize', onResizeHandler, this);
                    this.tooltip.destroy();
                    this.tooltip = null;

                    Graph.prototype.destroy.call(this);
                }
            })
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
                nodes.push({
                    id: module.data.name,
                    group: group,
                    main: !module.data.reasons.itemCount
                });
                module.data.reasons.forEach(function(reason) {
                    links.push({ source: reason.data.name, target: module.data.name });
                });
            });

            return {
                nodes: nodes,
                links: links
            };
        });

        this.satellite.graph.setGraph(this.graph);
    },
    destroy: function() {
        this.graph.destroy();
        this.graph = null;

        Node.prototype.destroy.call(this);
    }
});
