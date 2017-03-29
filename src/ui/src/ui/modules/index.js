var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var sum = require('basis.data.index').sum;
var dict = require('basis.l10n').dictionary(__filename);
var Table = require('../table/index');
var TableHead = require('app.ui.table').Head;
var TableRow = require('app.ui.table').Row;
var utils = require('app.utils');
var pageSwitcher = require('app.pageSwitcher');
var detailTarget = require('app.pages.details.target');
var type = require('app.type');
var transport = require('app.transport');

var Row = TableRow.subclass({
    template: resource('./template/row.tmpl'),
    binding: {
        id: 'data:index',
        name: 'data:',
        size: Value.query('data.size').as(function(size) {
            return utils.roundSize(size) + ' ' + utils.getPostfix(size);
        })
    },
    action: {
        gotoModule: function(e) {
            var resource = this.data.resource;

            e.die();

            if (e.shiftKey && resource) {
                if (type.Env.data.connected) {
                    type.Env.openFile(resource.data.name);
                } else {
                    transport.api.callRemote('openInEditor', resource.data.name);
                }
            } else {
                detailTarget.setDelegate(this.target);
                pageSwitcher.set('details');
            }
        }
    }
});

var Head = TableHead.subclass({
    childNodes: [
        {data: {content: dict.token('id')}},
        {data: {content: dict.token('name')}},
        {data: {content: dict.token('size')}}
    ]
});

var Foot = Node.subclass({
    template: resource('./template/foot.tmpl'),
    binding: {
        count: Value.query('owner.dataSource.itemCount'),
        size: sum(Value.query('owner.dataSource'), 'update', 'data.size').as(function(size) {
            return utils.roundSize(size) + ' ' + utils.getPostfix(size);
        }),
    }
});

var ModuleTable = Table.subclass({
    sorting: 'data.index',
    childClass: Row,
    satellite: {
        head: Head,
        foot: Foot
    }
});

module.exports = {
    Table: ModuleTable,
    Head: Head,
    Row: Row,
    Foot: Foot
};
