var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;
var Slider = require('basis.ui.slider').Slider;
var Balloon = require('basis.ui.popup').Balloon;
var Module = require('app.type').Module;
var ModuleLink = require('app.type').ModuleLink;
var Viva = require('app.vendor.vivagraph');
var typeByExt = require('app.utils').typeByExt;

function getTypeByExt(ext) {
    return typeByExt.hasOwnProperty(ext) ? typeByExt[ext] : null;
}

var fileInfoPopup = new Balloon({
    template: resource('./template/popup.tmpl'),
    binding: {
        isEntry: Value.query('data.reasons.itemCount').as(basis.bool.invert),
        moduleType: Value.query('data.type'),
        fileType: Value.query('data.resource.data.extname').as(getTypeByExt),
        name: Value.query('data.name')
    },
    dir: 'center top center bottom',
    autorotate: true,
    handler: {
        delegateChanged: function() {
            if (this.delegate) {
                this.show(this.delegate.element);
            } else {
                this.hide();
            }
        }
    }
});

function coord(name) {
    return function(node) {
        return node[name] && node[name].toFixed(2);
    };
}

var GraphNode = Node.subclass({
    matched: false,

    template: resource('./template/node.tmpl'),
    binding: {
        x: coord('x'),
        y: coord('y'),
        fileType: Value.query('data.resource.data.extname').as(getTypeByExt),
        isEntry: Value.query('data.reasons.itemCount').as(basis.bool.invert),
        moduleType: Value.query('data.type'),
        hasSelected: Value.query('parentNode.selection.itemCount').as(Boolean),
        matched: Value.query(Module.allWrapper, 'dataset')
            .pipe('itemsChanged', function(dataset) {
                return basis.array((dataset || Module.allWrapper).getItems());
            })
            .compute(function(node, matched) {
                return matched.indexOf(node.target) !== -1;
            })
    },
    action: {
        hover: function() {
            fileInfoPopup.setDelegate(this);
        },
        unhover: function() {
            fileInfoPopup.setDelegate();
        }
    },

    updatePos: function(pos) {
        this.x = pos.x;
        this.y = pos.y;
        this.updateBind('x');
        this.updateBind('y');
    }
});

var GraphLink = Node.subclass({
    template: resource('./template/link.tmpl'),
    binding: {
        x1: coord('x1'),
        y1: coord('y1'),
        x2: coord('x2'),
        y2: coord('y2'),
    },
    updatePos: function(pos1, pos2) {
        this.x1 = pos1.x;
        this.y1 = pos1.y;
        this.x2 = pos2.x;
        this.y2 = pos2.y;
        this.updateBind('x1');
        this.updateBind('y1');
        this.updateBind('x2');
        this.updateBind('y2');
    }
});

var svgBase = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
var svgGraphics = new Node({
    initialScale: .45,
    actualScale: 1,
    offsetX: 0,
    offsetY: 0,

    template: resource('./template/graph.tmpl'),
    binding: {
        matrix: function(node) {
            return 'matrix(' + [node.actualScale, 0, 0, node.actualScale, node.offsetX, node.offsetY] + ')';
        }
    },
    action: {
        resetSelection: function() {
            this.selection.clear();
        }
    },

    init: function() {
        Node.prototype.init.call(this);
        this.init = function() {
            // otherwise Viva graph doesn't work
        };
    },

    handler: {
        ownerChanged: function() {
            basis.nextTick(function() {
                renderer.reset();
            });
        }
    },

    selection: {
        multiple: true
    },
    grouping: {
        rule: function(node) {
            return node instanceof GraphNode;
        },
        sorting: 'data.id',
        childClass: {
            template: '<svg:g/>'
        }
    },

    childFactory: function(config) {
        var Class = config.delegate.delegate.typeName == 'Module' ? GraphNode : GraphLink;

        return new Class(config);
    },

    //
    // node
    //
    node: function(graphNode) {
        return this.appendChild(Module.getSlot(graphNode.id));
    },
    initNode: function() {
        // otherwise Viva graph doesn't work
    },
    updateNodePosition: function(node, pos) {
        node.updatePos(pos);
    },
    releaseNode: function(node) {
        node.destroy();
    },

    //
    // link
    //
    link: function(graphNode) {
        return this.appendChild(ModuleLink.getSlot({
            from: graphNode.fromId,
            to: graphNode.toId
        }));
    },
    initLink: function() {
        // otherwise Viva graph doesn't work
    },
    updateLinkPosition: function(node, fromPos, toPos) {
        node.updatePos(fromPos, toPos);
    },
    releaseLink: function(node) {
        node.destroy();
    },

    //
    // transformation
    //

    updateTransform: function() {
        this.updateBind('matrix');
    },

    // Sets translate operation that should be applied to all nodes and links.
    graphCenterChanged: function(x, y) {
        this.offsetX = x;
        this.offsetY = y;
        this.updateTransform();
    },

    // Default input manager listens to DOM events to process nodes drag-n-drop
    inputManager: function() {
        return {
            bindDragNDrop: function(node, handlers) {
                if (handlers) {
                    var events = Viva.Graph.Utils.dragndrop(node.ui.element);

                    ['onStart', 'onDrag', 'onStop'].forEach(function(name) {
                        if (typeof handlers[name] === 'function') {
                            events[name](handlers[name]);
                        }
                    });

                    node.events = events;
                } else if (node.events) {
                    node.events.release();
                    node.events = null;
                }
            }
        };
    },

    translateRel: function(dx, dy) {
        var p = svgBase.createSVGPoint();
        var t = this.tmpl.transformElement.getCTM();
        var origin = svgBase.createSVGPoint().matrixTransform(t.inverse());

        p.x = dx;
        p.y = dy;

        p = p.matrixTransform(t.inverse());
        p.x = (p.x - origin.x) * t.a;
        p.y = (p.y - origin.y) * t.d;

        t.e += p.x;
        t.f += p.y;

        this.actualScale = t.a;
        this.offsetX = t.e;
        this.offsetY = t.f;

        this.updateTransform();
    },

    scale: function(scaleFactor, scrollPoint) {
        var p = svgBase.createSVGPoint();

        p.x = scrollPoint.x;
        p.y = scrollPoint.y;

        p = p.matrixTransform(this.tmpl.transformElement.getCTM().inverse()); // translate to svg coordinates

        // Compute new scale matrix in current mouse position
        var t = this.tmpl.transformElement
            .getCTM()
            .multiply(
                svgBase
                    .createSVGMatrix()
                    .translate(p.x, p.y)
                    .scale(scaleFactor)
                    .translate(-p.x, -p.y)
            );

        this.actualScale = t.a;
        this.offsetX = t.e;
        this.offsetY = t.f;

        this.updateTransform();

        return this.actualScale;
    },

    resetScale: function() {
        this.actualScale = this.initialScale;
        this.offsetX = 0;
        this.offsetY = 0;

        this.updateTransform();
    },

    beginRender: function() {
        // stub
    },
    endRender: function() {
        // stub
    }
});

var graph = Viva.Graph.graph();
var renderer = Viva.Graph.View.renderer(graph, {
    container: svgGraphics.element,
    graphics: svgGraphics,
    prerender: 50
});

renderer.run();

var isPaused = new Value({ value: true });

var SpeedSlider = Slider.subclass({
    template: resource('./template/slider.tmpl'),
    max: 100,
    step: 10,
    value: 30
});

var LinksCounter = Node.subclass({
    template: resource('./template/counters.tmpl'),
    binding: {
        totalLinks: Value.query('owner.<static>totalLinks.value'),
        renderedLinks: Value.query('owner.<static>renderedLinks.value'),
        totalNodes: Value.query('owner.<static>totalNodes.value'),
        renderedNodes: Value.query('owner.<static>renderedNodes.value')
    }
});

var Control = Node.subclass({
    template: resource('./template/control.tmpl'),
    binding: {
        isPaused: isPaused
    },
    action: {
        toggle: function() {
            isPaused.set(!isPaused.value);
        }
    }
});

module.exports = Node.subclass({
    template: resource('./template/view.tmpl'),
    satellite: {
        graph: svgGraphics,
        speedSlider: SpeedSlider,
        linksCounter: LinksCounter,
        control: Control
    },
    binding: {
        graph: 'satellite:',
        speedSlider: 'satellite:',
        linksCounter: 'satellite:',
        control: 'satellite:'
    },
    isPaused: isPaused,
    init: function() {
        this.totalNodes = Value.query(Module.allWrapper, 'itemCount');
        this.renderedNodes = new Value({ value: 0 });
        this.totalLinks = Value.query(ModuleLink.allWrapper, 'itemCount');
        this.renderedLinks = new Value({ value: 0 });

        Node.prototype.init.call(this);

        isPaused.link(this, function(value) {
            if (value) {
                this.stop();
            } else {
                this.start();
            }
        });

        var links = ModuleLink.allWrapper.getValues();

        this.links = links;

        Module.allWrapper.addHandler({
            itemsChanged: function(dataset, delta) {
                if (delta.deleted) {
                    delta.deleted.forEach(function(file) {
                        graph.removeNode(file.getId());
                    });

                    this.renderedLinks.set(graph.getLinksCount());
                    this.renderedNodes.set(graph.getNodesCount());
                }
            }
        }, this);

        ModuleLink.allWrapper.addHandler({
            itemsChanged: function(dataset, delta) {
                if (delta.inserted) {
                    delta.inserted.forEach(function(link) {
                        links.push(link);
                    });
                }

                if (delta.deleted) {
                    delta.deleted.forEach(function(link) {
                        basis.array.remove(links, link);
                        graph.removeLink(link.data.from, link.data.to);
                    });
                }
            }
        });
    },
    destroy: function() {
        this.totalNodes.destroy();
        this.totalNodes = null;
        this.renderedNodes.destroy();
        this.renderedNodes = null;
        this.totalLinks.destroy();
        this.totalLinks = null;
        this.renderedLinks.destroy();
        this.renderedLinks = null;

        Node.prototype.destroy.call(this);
    },
    start: function() {
        renderer.resume();

        (function popNode() {
            if (this.links.length) {
                var link;

                while (link = this.links.shift()) {
                    var fileLink = ModuleLink.get({
                        from: link.data.from,
                        to: link.data.to
                    });

                    if (fileLink) {
                        graph.addLink.apply(graph, [link.data.from, link.data.to]);

                        this.renderedLinks.set(graph.getLinksCount());
                        this.renderedNodes.set(graph.getNodesCount());
                        break;
                    }
                }
            }

            this.timer = setTimeout(popNode.bind(this), this.satellite.speedSlider.value);
        }.bind(this))();
    },
    stop: function() {
        renderer.pause();

        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
});
