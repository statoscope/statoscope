var Page = require('app.ui').Page;
var Graph = require('./graph');
var type = require('app.type');

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: Graph
    }
});
