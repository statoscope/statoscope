var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Extract = require('basis.data.dataset').Extract;
var sum = require('basis.data.index').sum;
var template = require('basis.template');
var type = require('app.type');
var utils = require('app.utils');
var ModulesTable = require('../modules/index');
var SplitView = require('../splitView/index');

var templates = template.define('app.ui.fileStat', {
    stat: resource('./template/template.tmpl')
});

var Stat = Node.subclass({
    template: templates.stat,
    satellite: {
        modules: SplitView.subclass({
            autoDelegate: true,
            template: resource('./template/split.tmpl'),
            satellite: {
                left: {
                    dataSource: Value.query('<static>related'),
                    instance: ModulesTable
                },
                right: {
                    dataSource: Value.query('<static>retained'),
                    instance: ModulesTable
                }
            },
            binding: {
                relatedAmount: Value.query('<static>related.itemCount'),
                relatedSize: sum(Value.query('<static>related'), 'update', 'data.size').as(utils.roundSize),
                relatedPostfix: sum(Value.query('<static>related'), 'update', 'data.size').as(utils.getPostfix),

                retainedAmount: Value.query('<static>retained.itemCount'),
                retainedSize: sum(Value.query('<static>retained'), 'update', 'data.size').as(utils.roundSize),
                retainedPostfix: sum(Value.query('<static>retained'), 'update', 'data.size').as(utils.getPostfix)
            },
            init: function() {
                this.related = Value.query(this, 'target').as(type.Module.byFile);
                this.retained = new Extract({
                    source: this.related,
                    rule: 'data.retained'
                });

                SplitView.prototype.init.call(this);
            },
            destroy: function() {
                this.retained.destroy();
                this.retained = null;
                this.related.destroy();
                this.related = null;

                SplitView.prototype.destroy.call(this);
            }
        })
    },
    binding: {
        name: 'data:',
        size: Value.query('data.size').as(utils.roundSize),
        postfix: Value.query('data.size').as(utils.getPostfix),
        modules: 'satellite:',
    }
});

module.exports = Stat;
