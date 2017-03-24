var Value = require('basis.data').Value;
var DataObject = require('basis.data').Object;
var addHandler = require('basis.dom.event').addHandler;
var Page = require('app.ui').Page;
var type = require('app.type');
var utils = require('app.utils');
var Tooltip = require('app.ui').Tooltip;
var typeByExt = utils.typeByExt;

require('app.vendor.foamtree');

var TreeMap = global.CarrotSearchFoamTree;

function getTypeByExt(ext) {
    return typeByExt.hasOwnProperty(ext) ? typeByExt[ext] : null;
}

function makeNode(name, size) {
    return {
        label: name,
        weight: size,
        groups: []
    };
}

function applyPath(tree, info) {
    var parts = info.path.split('/');
    var size = info.size;
    var cursor = tree;
    var current;
    var stack = [tree];

    if (!tree._resolved) {
        tree._resolved = {};
    }

    if (tree._resolved[info.path]) {
        return;
    }

    while (current = parts.shift()) {
        var target = basis.array.search(cursor.groups, current, 'label');

        if (!target) {
            target = makeNode(current, 0);
            cursor.groups.push(target);
        }

        stack.push(target);
        cursor = target;
        target.path = stack
            .slice(1)
            .map(basis.getter('label'))
            .join('/');
    }

    stack.forEach(function(item) {
        item.weight += size;
    });

    tree._resolved[info.path] = true;
}

function calcPercentsAndUpdateNames(tree) {
    var totalSize = tree.weight;

    // todo make non recursive
    function walk(root) {
        var percent = 100 / totalSize * root.weight;

        root.size = utils.roundSize(root.weight);
        root.postfix = utils.getPostfix(root.weight);
        root.percent = percent.toFixed(2);
        root.groups.forEach(walk);
    }

    walk(tree);
}

var watcher = Value.from(type.Module.files, 'itemsChanged', function(files) {
    if (!files) {
        return;
    }

    files = files.getValues('data');

    var tree = makeNode('/', 0);
    var appliedFiles = {};
    var sharePart = utils.sharePartOfPaths(files.map(basis.getter('name')));

    files = files.map(function(file) {
        return {
            name: file.name.slice(sharePart.length + 1),
            size: file.size
        };
    });

    files.forEach(function(file) {
        if (!appliedFiles[file.name]) {
            appliedFiles[file.name] = true;
            applyPath(tree, { path: file.name, size: file.size });
        }
    });

    calcPercentsAndUpdateNames(tree);

    /** @cut */ basis.dev.log('tree map', tree);

    return tree;
});

var page = new Page({
    template: resource('./template/page.tmpl'),
    className: 'Page.FileMap',
    type: 'fit',
    tree: null,
    tooltip: new Tooltip({
        template: resource('./template/tooltip.tmpl'),
        binding: {
            path: 'data:',
            size: 'data:',
            postfix: 'data:',
            percent: 'data:',
            groups: 'data:',
            type: Value.query('data.path').as(type.File).pipe('update', 'data.extname').as(getTypeByExt)
        }
    }),
    handler: {
        open: function() {
            this.start();
        },
        close: function() {
            this.stop();
        }
    },
    action: {
        mousemove: function(e) {
            var pageX = e.pageX;
            var pageY = e.pageY;

            this.tooltip.setLeft(pageX - 10);
            this.tooltip.setBottom(window.innerHeight - pageY + 10);
        },
        mouseout: function() {
            this.removeTooltip();
        }
    },
    resizeMap: function() {
        basis.asap(function() {
            if (this.treemap) {
                this.treemap.resize();
            }
        }, this);
    },
    removeTooltip: function() {
        this.tooltip.setDelegate(null);
    },
    start: function() {
        basis.asap(function() {
            if (!this.treemap) {
                this.treemap = new TreeMap({
                    element: this.tmpl.element,

                    layout: 'squarified',
                    stacking: 'flattened',

                    pixelRatio: window.devicePixelRatio || 1,

                    maxGroupLevelsDrawn: Number.MAX_VALUE,
                    maxGroupLabelLevelsDrawn: Number.MAX_VALUE,

                    pullbackDuration: 0,
                    rolloutDuration: 0,
                    fadeDuration: 0,

                    zoomMouseWheelDuration: 400,

                    onGroupClick: function(event) {
                        event.preventDefault();
                    },
                    onGroupHover: function(event) {
                        if (event.group && event.group.attribution) {
                            event.preventDefault();

                            return false;
                        }

                        if (event.group) {
                            this.tooltip.setDelegate(new DataObject({ data: event.group }));
                        } else {
                            this.tooltip.setDelegate();
                        }
                    }.bind(this),
                    onGroupMouseWheel: this.removeTooltip.bind(this),
                    onGroupExposureChanging: this.removeTooltip.bind(this),
                    onGroupOpenOrCloseChanging: this.removeTooltip.bind(this),
                });
            }

            this.treemap.set('dataObject', watcher.value);
        }, this);
    },
    stop: function() {
        // dummy
    }
});

watcher.link(page, function(dataObject) {
    if (this.treemap && this.opened.value) {
        this.treemap.set('dataObject', dataObject);
    }
});

var resizeTimeout;

addHandler(window, 'resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(this.resizeMap.bind(this), 300);
}, page);

module.exports = page;
