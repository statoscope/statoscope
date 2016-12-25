var DataObject = require('basis.data').Object;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var Graph = require('./graph');
var type = require('app.type');

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: {
            instance: Graph,
            config: function() {
                return {
                    groupsColor: new DataObject({
                        data: {
                            'all': 0,
                            'js': 1,
                            'json': 1,
                            'css': 2,
                            'html': 3,
                            'eot': 4,
                            'ttf': 4,
                            'woff': 4,
                            'woff2': 4,
                            'svg': 5,
                            'jpg': 5,
                            'jpeg': 5,
                            'png': 5,
                            'gif': 5
                        }
                    })
                }
            },
            delegate: Value.query('data.profile.data.modules').pipe('itemsChanged', function(modules) {
                var nodes = [];
                var links = [];

                modules.forEach(function(module) {
                    var group = module.data.name.split('.').pop();

                    nodes.push({id: module.data.id, name: module.data.name, group: group, main: !module.data.id});
                    module.data.reasons.forEach(function(reason) {
                        links.push({source: reason.data.id, target: module.data.id});
                    });
                });

                return new DataObject({
                    data: {
                        nodes: nodes,
                        links: links
                    }
                });
            })
        }
    },
});
