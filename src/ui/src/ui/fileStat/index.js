var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Extract = require('basis.data.dataset').Extract;
var sum = require('basis.data.index').sum;
var template = require('basis.template');
var type = require('app.type');
var utils = require('app.utils');
var ModulesTable = require('../modules/index');

var templates = template.define('app.ui.fileStat', {
    stat: resource('./template/template.tmpl')
});

var Stat = Node.subclass({
    template: templates.stat,
    satellite: {
        modules: {
            dataSource: type.Env.retained,
            instance: ModulesTable
        }
    },
    binding: {
        name: 'data:',
        size: Value.query('data.size').as(utils.roundSize),
        postfix: Value.query('data.size').as(utils.getPostfix),
        modules: 'satellite:',
        retainedAmount: type.Env.retainedAmount,
        retainedSize: type.Env.retainedSize,
        retainedPostfix: type.Env.retainedPostfix
    }
});

module.exports = Stat;
