var Node = require('basis.ui').Node;
var event = require('basis.event');
var Value = require('basis.data').Value;
var Expression = require('basis.data.value').Expression;
var resolveValue = require('basis.data').resolveValue;
var d3 = require('d3');

// todo correct center on resize, zoom, drag field
module.exports = Node.subclass({
    template: resource('./template/graph.tmpl'),
    width: 0,
    height: 0,
    widthRA_: null,
    heightRA_: null,
    graphRA_: null,
    emit_widthChanged: event.create('widthChanged'),
    emit_heightChanged: event.create('heightChanged'),
    emit_graphChanged: event.create('graphChanged'),
    propertyDescriptors: {
        width: 'widthChanged',
        height: 'heightChanged',
        graph: 'graphChanged'
    },
    extendNodes: basis.fn.$undef,
    applySimulation: basis.fn.$undef,
    setWidth: function(value) {
        value = resolveValue(this, this.setWidth, value, 'widthRA_');

        if (this.width !== value) {
            this.width = value;
            this.emit_widthChanged();
        }
    },
    setHeight: function(value) {
        value = resolveValue(this, this.setHeight, value, 'heightRA_');

        if (this.height !== value) {
            this.height = value;
            this.emit_heightChanged();
        }
    },
    setGraph: function(value) {
        value = resolveValue(this, this.setGraph, value, 'graphRA_');

        if (this.graph !== value) {
            this.graph = value;
            this.applyGraph(value);
            this.emit_graphChanged();
        }
    },
    applyGraph: function(graph) {
        if (!graph || !graph.nodes) {
            return;
        }

        basis.asap(function() {
            var linksExist;
            var nodesExist;
            var nodesNew;
            var linksNew;

            linksExist = this.svg
                .select('g.links')
                .selectAll('line')
                .data(graph.links || []);

            nodesExist = this.svg
                .select('g.nodes')
                .selectAll('circle')
                .data(graph.nodes);

            linksExist.exit().remove();
            nodesExist.exit().remove();

            nodesNew = nodesExist.enter().append('circle');
            linksNew = linksExist.enter().append('line');

            this.extendNodes(this.svg, this.simulation, nodesNew, linksNew);
            this.applySimulation(this.svg, this.simulation, graph);
        }, this);
    },
    init: function() {
        var width = this.width;
        var height = this.height;
        var graph = this.graph;

        Node.prototype.init.call(this);

        this.width = null;
        this.height = null;
        this.graph = null;

        this.svg = d3.select(document.createElementNS(d3.namespaces.svg, 'svg'));
        this.svg.append('g').attr('class', 'links');
        this.svg.append('g').attr('class', 'nodes');
        this.simulation = d3.forceSimulation();
        this.setWidth(width);
        this.setHeight(height);
        this.setGraph(graph);
        this.sizeExpression = new Expression(
            Value.query(this, 'width'),
            Value.query(this, 'height'),
            function(width, height) {
                return {
                    width: width,
                    height: height
                };
            }
        );
        this.sizeExpression.link(this, function(size) {
            this.svg.attr('width', size.width).attr('height', size.height);
        });
    },
    postInit: function() {
        Node.prototype.postInit.call(this);

        this.element.appendChild(this.svg.node());
    },
    destroy: function() {
        this.svg.remove();
        this.svg = null;
        this.widthRA_ && resolveValue(this, null, null, 'widthRA_');
        this.heightRA_ && resolveValue(this, null, null, 'heightRA_');
        this.graphRA_ && resolveValue(this, null, null, 'graphRA_');
        this.sizeExpression.destroy();
        this.sizeExpression = null;

        Node.prototype.destroy.call(this);
    }
});
