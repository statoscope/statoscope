var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var IssueList = require('app.ui').IssueList;
var type = require('app.type');

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: {
            instance: IssueList.subclass({
                dataSource: Value.query('data.profile.data.warnings'),
                childClass: {
                    template: resource('./template/item.tmpl')
                }
            })
        }
    }
});
