var Value = require('basis.data').Value;
var sum = require('basis.data.index').sum;
var Node = require('basis.ui').Node;
var Page = require('app.ui').Page;
var type = require('app.type');
var utils = require('app.utils');
var AssetsTable = require('app.ui').Assets;
var ModulesTable = require('app.ui.modulesTable').Table;
var SplitView = require('app.ui').SplitView;

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
                modules: 'satellite:'
            },
            satellite: {
                modules: new SplitView({
                    autoDelegate: true,
                    template: resource('./template/split.tmpl'),
                    binding: {
                        modulesCount: Value.query(type.Module.allWrapper, 'itemCount'),
                        modulesSize: sum(type.Module.allWrapper, 'update', 'data.size').as(formatSize),

                        assetsCount: Value.query(type.Asset.all, 'itemCount'),
                        assetsSize: sum(type.Asset.all, 'update', 'data.size').as(formatSize)
                    },
                    satellite: {
                        left: new ModulesTable({
                            dataSource: type.Module.allWrapper,
                        }),
                        right: new AssetsTable({
                            dataSource: type.Asset.all,
                        })
                    }
                })
            }
        })
    }
});
