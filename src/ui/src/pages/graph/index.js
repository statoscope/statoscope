var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var type = require('app.type');
var Graph = require('./graph');

module.exports = new Page({
    delegate: Value.query('owner').as(function(owner) {
        return owner ? type.Source : null;
    }),
    satellite: {
        content: Graph
    }
});
