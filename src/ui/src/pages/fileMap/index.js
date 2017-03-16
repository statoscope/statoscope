var Value = require('basis.data').Value;
var addHandler = require('basis.dom.event').addHandler;
var Page = require('app.ui').Page;
var type = require('app.type');
var webtreemap = require('app.vendor.webtree');
var utils = require('app.utils');

function makeNode(name, size) {
    return {
        name: name,
        originalName: name,
        data: {
            $area: size
        },
        children: []
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
        var target = basis.array.search(cursor.children, current, 'name');

        if (!target) {
            target = makeNode(current, 0);
            cursor.children.push(target);
        }

        stack.push(target);
        cursor = target;
    }

    stack.forEach(function(item) {
        item.data.$area += size;
    });

    tree._resolved[info.path] = true;
}

function calcPercentsAndUpdateNames(tree) {
    var totalSize = tree.data.$area;

    function walk(root) {
        var percent = 100 / totalSize * root.data.$area;
        var size = utils.getSize(root.data.$area);
        var postfix = utils.getPostfix(root.data.$area);

        root.originalName = root.name;
        root.name = basis.string.format('{name} • {size} {postfix} • {percent}%', {
            name: root.originalName,
            size: postfix == 'B' ? size : size.toFixed(2),
            postfix: utils.getPostfix(root.data.$area),
            percent: percent.toFixed(2)
        });
        root.children.forEach(walk);
    }

    walk(tree);
}

var page = new Page({
    className: 'Page.FileMap',
    type: 'fit',
    tree: null,
    handler: {
        open: function() {
            this.start();
        },
        close: function() {
            this.stop();
        }
    },
    updateMap: function() {
        basis.asap(function() {
            webtreemap(this.element, this.tree);
            this.element.firstElementChild.style.width = '100%';
            this.element.firstElementChild.style.height = '100%';
        }, this);
    },
    start: function() {
        this.watcher = Value.from(type.Module.files, 'itemsChanged', function(files) {
            if (!files) {
                return;
            }

            files = files.getValues('data');

            var appliedFiles = {};
            var partsCount = [];
            var sharePart;

            files.forEach(function(file) {
                var parts = file.name.split('/');

                for (var i = 0; i < parts.length; i++) {
                    if (partsCount[i]) {
                        if (partsCount[i].name == parts[i]) {
                            partsCount[i].count++;
                        } else {
                            break;
                        }
                    } else {
                        partsCount[i] = {
                            name: parts[i], count: 1
                        };
                    }
                }
            });

            sharePart = partsCount
                .filter(function(part) {
                    return part.count == files.length;
                })
                .map(function(part) {
                    return part.name;
                });

            files = files.map(function(file) {
                return {
                    name: file.name.slice(sharePart.join('/').length + 1),
                    size: file.size
                };
            });

            this.element.innerHTML = '';
            this.tree = makeNode('/', 0);

            files.forEach(function(file) {
                if (!appliedFiles[file.name]) {
                    appliedFiles[file.name] = true;
                    applyPath(this.tree, { path: file.name, size: file.size });
                }
            }, this);

            calcPercentsAndUpdateNames(this.tree);
            this.updateMap();
        }.bind(this));
    },
    stop: function() {
        this.watcher.destroy();
        this.watcher = null;
    }
});

addHandler(window, 'resize', function() {
    this.updateMap();
}, page);

module.exports = page;
