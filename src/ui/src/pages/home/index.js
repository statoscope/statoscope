var Value = require('basis.data').Value;
var sum = require('basis.data.index').sum;
var Node = require('basis.ui').Node;
var Page = require('app.ui').Page;
var type = require('app.type');
var utils = require('app.utils');

function formatSize(size) {
    var unit = utils.getPostfix(size);

    switch (unit) {
        case 'KB':
            size = Math.round(utils.getSize(size));
            break;
        case 'MB':
            size = utils.getSize(size).toFixed(2);
            break;
    }

    return size + '\xA0' + unit;
}

module.exports = new Page({
    className: 'Page.Home',
    satellite: {
        content: new Node({
            template: resource('./template/page.tmpl'),
            binding: {
                modules: resource('./modules/modules/index.js'),
                modulesCount: Value.query(type.Module.allWrapper, 'itemCount'),
                modulesSize: sum(type.Module.allWrapper, 'update', 'data.size').as(formatSize),
                assets: resource('./modules/assets/index.js'),
                assetsCount: Value.query(type.Asset.all, 'itemCount'),
                assetsSize: sum(type.Asset.all, 'update', 'data.size').as(formatSize)
            }
        })
    }
});
