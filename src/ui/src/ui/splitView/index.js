var Node = require('basis.ui').Node;
var template = require('basis.template');

var templates = template.define('app.ui', {
    splitView: resource('./template/template.tmpl')
});

var SplitView = Node.subclass({
    template: templates.splitView,
    binding: {
        left: 'satellite:',
        right: 'satellite:',
    }
});

module.exports = SplitView;
