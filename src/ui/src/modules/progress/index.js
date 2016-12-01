var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;

module.exports = Node.subclass({
    active: basis.PROXY,
    autoDelegate: true,
    template: resource('./template/progress.tmpl'),
    binding: {
        status: 'data:',
        progress: Value.query('data.progress').as(function(progress) {
            return parseInt((progress || 0) * 100);
        })
    }
});
