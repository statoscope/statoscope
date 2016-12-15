var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var sum = require('basis.data.index').sum;
var dict = require('basis.l10n').dictionary(__filename);

var Table = require('app.ui').Table;
var TableHead = require('app.ui.table').Head;
var TableRow = require('app.ui.table').Row;
var FileSizeCell = require('app.ui.cells').FileSize;

module.exports = Table.subclass({
    dataSource: Value.query('data.profile.data.modules'),
    childClass: TableRow.subclass({
        template: resource('./template/row.tmpl'),
        binding: {
            id: 'data:',
            name: 'data:',
            fileSizeCell: 'satellite:'
        },
        satellite: {
            fileSizeCell: FileSizeCell.subclass({
                size: Value.query('owner.data.size')
            })
        }
    }),
    satellite: {
        head: TableHead.subclass({
            childNodes: [
                { content: dict.token('id') },
                { content: dict.token('name') },
                { content: dict.token('size') }
            ]
        }),
        foot: Node.subclass({
            template: resource('./template/foot.tmpl'),
            binding: {
                fileSizeCell: 'satellite:'
            },
            satellite: {
                fileSizeCell: FileSizeCell.subclass({
                    size: sum(Value.query('owner.owner.dataSource'), 'update', 'data.size')
                })
            }
        })
    }
});
