var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var sum = require('basis.data.index').sum;
var dict = require('basis.l10n').dictionary(__filename);
var Table = require('../table/index');
var TableHead = require('app.ui.table').Head;
var TableRow = require('app.ui.table').Row;
var utils = require('app.utils');

module.exports = Table.subclass({
    sorting: 'data.index',
    childClass: TableRow.subclass({
        template: resource('./template/row.tmpl'),
        binding: {
            id: 'data:index',
            name: 'data:',
            size: Value.query('data.size').as(utils.roundSize),
            postfix: Value.query('data.size').as(utils.getPostfix),
            occurrences: Value.query('data.reasons.itemCount'),

            retainedAmount: Value.query('data.retained.itemCount'),
            retainedSize: sum(Value.query('data.retained'), 'update', 'data.size').as(utils.roundSize),
            retainedPostfix: sum(Value.query('data.retained'), 'update', 'data.size').as(utils.getPostfix),

            exclusiveAmount: Value.query('data.exclusive.itemCount'),
            exclusiveSize: sum(Value.query('data.exclusive'), 'update', 'data.size').as(utils.roundSize),
            exclusivePostfix: sum(Value.query('data.exclusive'), 'update', 'data.size').as(utils.getPostfix),
        }
    }),
    satellite: {
        head: TableHead.subclass({
            childNodes: [
                { data: { content: dict.token('id') } },
                { data: { content: dict.token('name') } },
                { data: { content: dict.token('size') } },
                { data: { content: dict.token('occurrences') } },
                { data: { content: dict.token('retained') } },
                { data: { content: dict.token('exclusive') } }
            ]
        }),
        foot: Node.subclass({
            template: resource('./template/foot.tmpl'),
            binding: {
                size: sum(Value.query('owner.dataSource'), 'update', 'data.size').as(utils.roundSize),
                postfix: sum(Value.query('owner.dataSource'), 'update', 'data.size').as(utils.getPostfix),
            }
        })
    }
});
