var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var type = require('app.type');

module.exports = Node.subclass({
    active: basis.PROXY,
    delegate: type.Source,
    template: resource('./template/progress.tmpl'),
    binding: {
        status: 'data:',
        progress: Value.query('data.progress').as(function(progress) {
            return parseInt(Number(progress) * 100);
        })
    }
});
