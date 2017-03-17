var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var type = require('app.type');

module.exports = new Page({
    className: 'Page.Env',
    satellite: {
        content: {
            delegate: type.Env,
            instance: Node.subclass({
                template: resource('./template/env.tmpl'),
                binding: {
                    evnName: Value.query('data.name'),
                    filePath: Value.query('data.file.data.name')
                }
            })
        }
    }
});
