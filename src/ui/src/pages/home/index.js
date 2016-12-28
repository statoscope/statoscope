var Value = require('basis.data').Value;
var sum = require('basis.data.index').sum;
var Node = require('basis.ui').Node;
var Page = require('app.ui').Page;
var type = require('app.type');
var utils = require('app.utils');

function formatSize(size) {
    var unit = utils.getPostfix(size);

    switch (unit) {
        case 'bytes':
            // nothing to do
            break;
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
    delegate: type.Source,
    satellite: {
        content: new Node({
            autoDelegate: true,
            template: resource('./template/page.tmpl'),
            binding: {
                modules: resource('./modules/modules/index.js'),
                modulesCount: Value.query('data.profile.data.modules.itemCount').as(Number),
                modulesSize: sum(Value.query('data.profile.data.modules'), 'update', 'data.size').as(formatSize),
                assets: resource('./modules/assets/index.js'),
                assetsCount: Value.query('data.profile.data.assets.itemCount').as(Number),
                assetsSize: sum(Value.query('data.profile.data.assets'), 'update', 'data.size').as(formatSize)
            }
        })
    }
});
