var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var type = require('app.type');

module.exports = Node.subclass({
    delegate: type.Source,
    template: resource('./template/view.tmpl'),
    binding: {
        processing: Value.query('data.status').as(function(status) {
            return status === 'compiling';
        }),
        progress: Value.query('data.progress').as(function(progress) {
            return progress * 100;
        })
    }
});
