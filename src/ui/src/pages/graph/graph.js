var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Vector = require('basis.data.vector').Vector;
var vectorCount = require('basis.data.vector').count;
var IndexMap = require('basis.data.index').IndexMap;
var sum = require('basis.data.index').sum;
var addHandler = require('basis.dom.event').addHandler;
var removeHandler = require('basis.dom.event').removeHandler;
var Module = require('app.type').Module;
var Tooltip = require('app.ui').Tooltip;
var ColorBar = require('app.ui').ColorBar;
var Graph = require('app.ui').Graph;
var d3 = require('d3');

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
var typeColor = {
    unknown: 'black',
    html: '#FF0000',
    script: '#99BBCC',
    style: '#FF69B4',
    template: '8CC88',
    l10n: 'orange',
    image: '#87CEEB',
    json: 'gray',
    font: '#4169E1'
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

function getTypeByExt(path) {
    var ext = basis.path.extname(String(path).split('!').pop());

    return typeByExt.hasOwnProperty(ext) ? typeByExt[ext] : 'unknown';
}

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
                    var index = typeOrder.indexOf(item.data.type);
                    return index !== -1 ? index : Infinity;
                },
                dataSource: function() {
                    return new IndexMap({
                        source: new Vector({
                            source: Value.query(this, 'data.profile.data.modules'),
                            rule: function(module) {
                                return getTypeByExt(module.data.name);
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
                            },
                            color: function(data, indexes, sourceObject) {
                                return typeColor[sourceObject.key];
                            }
                        }
                    });
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
                            return typeColor[d.group];
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
                                return typeColor[getTypeByExt(name)];
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
                // todo add error/warning count
                nodes.push({
                    id: module.data.name,
                    group: getTypeByExt(module.data.name),
                    main: !module.data.reasons.itemCount
                });
                module.data.reasons.forEach(function(reason) {
                    links.push({
                        source: reason.data.name,
                        target: module.data.name
                    });
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
