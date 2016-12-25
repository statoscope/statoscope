var Node = require('basis.ui').Node;
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

var content = new Node({
    autoDelegate: true,
    template: resource('./template/page.tmpl'),
    tree: null,
    marginBottom: 10,
    updateMap: function() {
        basis.asap(function() {
            this.element.style.height = window.innerHeight - this.element.getBoundingClientRect().top - this.marginBottom + 'px';
            webtreemap(this.element, this.tree);
        }.bind(this));
    }
});

var page = new Page({
    delegate: Value.query('owner').as(function(owner) {
        return owner ? type.Source : null;
    }),
    satellite: {
        content: content
    }
});

Value.query(page, 'target.data.profile.data.modules').pipe('itemsChanged', function(modules) {
    if (!modules) {
        return;
    }

    var allFiles = {};

    this.element.innerHTML = '';
    this.tree = makeNode('/', 0);

    modules.forEach(function(module) {
        var files = module.data.files;

        for (var fileName in files) {
            if (!files.hasOwnProperty(fileName)) {
                return;
            }

            var path = fileName.slice(type.Source.data.profile.data.context.length + 1);

            allFiles[fileName] = files[fileName];
            applyPath(this.tree, { path: path, size: files[fileName] });
        }
    }.bind(this));

    calcPercentsAndUpdateNames(this.tree);
    this.updateMap();
}.bind(content));

addHandler(window, 'resize', function() {
    this.updateMap();
}, content);

module.exports = page;
