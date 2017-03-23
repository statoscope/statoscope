var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var type = require('app.type');
var FileStat = require('app.ui').FileStat;

module.exports = new Page({
    className: 'Page.Env',
    satellite: {
        content: {
            delegate: type.Env,
            instance: Node.subclass({
                template: resource('./template/env.tmpl'),
                binding: {
                    evnName: Value.query('data.name'),
                    hasModules: Value.query('data.modules'),
                    stat: 'satellite:'
                },
                satellite: {
                    stat: {
                        existsIf: Value.query('data.modules'),
                        delegate: Value.query('data.file'),
                        instance: FileStat
                    }
                }
            })
        }
    }
});
