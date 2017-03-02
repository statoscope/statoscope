var Page = require('app.ui').Page;
var Graph = require('./graph');

module.exports = new Page({
    className: 'Page.Graph',
    satellite: {
        content: Graph
    }
});
