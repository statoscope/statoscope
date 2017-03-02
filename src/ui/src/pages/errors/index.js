var Page = require('app.ui').Page;
var IssueList = require('app.ui').IssueList;
var type = require('app.type');

module.exports = new Page({
    className: 'Page.Errors',
    satellite: {
        content: {
            instance: IssueList.subclass({
                dataSource: type.Error.all,
                childClass: {
                    template: resource('./template/item.tmpl')
                }
            })
        }
    }
});
