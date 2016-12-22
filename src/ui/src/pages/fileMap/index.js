var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var type = require('app.type');
var webtreemap = require('app.vendor.webtree');
// var utils = require('app.utils');

var content = new Node({
    autoDelegate: true,
    template: resource('./template/page.tmpl')
});

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

/*
 TODO
 function calcPecentsAndUpdateNames(tree) {
 var totalSize = tree.data.$area;

 function walk(root) {
 for (var i = 0; i < root.children.length; i++) {
 var item = root.children[i];
 var percent = 100 / totalSize * item.data.$area;
 var size = utils.getSize(item.data.$area);
 var postfix = utils.getPostfix(item.data.$area);

 item.name = basis.string.format('{name} • {size} {postfix} • {percent}%', {
 name: item.name,
 size: postfix == 'B' ? size : size.toFixed(2),
 postfix: utils.getPostfix(item.data.$area),
 percent: percent.toFixed(2)
 });

 walk(item);
 }
 }

 walk(tree);
 }*/

Value.query(type.Source, 'data.profile').link(content, function(profile) {
    if (!profile) {
        return;
    }

    var tree = makeNode('/', 0);
    var allFiles = {};

    profile.data.modules.forEach(function(module) {
        var files = module.data.files;

        for (var fileName in files) {
            if (!files.hasOwnProperty(fileName)) {
                return;
            }

            var path = fileName.slice(profile.data.context.length + 1);

            allFiles[fileName] = files[fileName];
            applyPath(tree, { path: path, size: files[fileName] });
        }
    });

    // calcPecentsAndUpdateNames(tree);
    basis.asap(function() {
        content.element.innerHTML = '';
        webtreemap(content.element, tree);
    });
});

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: content
    }
});
