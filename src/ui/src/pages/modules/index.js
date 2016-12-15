var Page = require('app.ui').Page;
var ModulesTable = require('./modules/modulesTable/index');
var type = require('app.type');

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: ModulesTable
    }
});
