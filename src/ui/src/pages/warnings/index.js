var Page = require('app.ui').Page;
var IssueList = require('app.ui').IssueList;
var type = require('app.type');

module.exports = new Page({
    className: 'Page.Warnings',
    satellite: {
        content: {
            instance: IssueList.subclass({
                dataSource: type.Warning.all,
                childClass: {
                    template: resource('./template/item.tmpl')
                }
            })
        }
    }
});
