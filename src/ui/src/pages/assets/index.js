var Page = require('app.ui').Page;
var AssetsTable = require('./modules/assetsTable/index');
var type = require('app.type');

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: AssetsTable
    }
});
