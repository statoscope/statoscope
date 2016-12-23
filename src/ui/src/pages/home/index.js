var Value = require('basis.data').Value;
var Node = require('basis.ui').Node;
var Page = require('app.ui').Page;
var type = require('app.type');

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: new Node({
            autoDelegate: true,
            template: resource('./template/page.tmpl'),
            binding: {
                stat: resource('./modules/stat/index.js'),
                modules: resource('./modules/modules/index.js'),
                modulesCount: Value.query('data.profile.data.modules.itemCount').as(Number),
                assets: resource('./modules/assets/index.js'),
                assetsCount: Value.query('data.profile.data.assets.itemCount').as(Number)
            }
        })
    }
});
