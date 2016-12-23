var Node = require('basis.ui').Node;
var Page = require('app.ui').Page;
var type = require('app.type');

var Stat = require('./modules/stat/index');
var ModulesTable = require('../modules/modules/modulesTable/index');
var AssetsTable = require('../assets/modules/assetsTable/index');

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: new Node({
            autoDelegate: true,
            template: resource('./template/page.tmpl'),
            satellite: {
                stat: Stat,
                modulesTable: ModulesTable,
                assetsTable: AssetsTable
            },
            binding: {
                stat: 'satellite:',
                modulesTable: 'satellite:',
                assetsTable: 'satellite:'
            }
        })
    }
});
