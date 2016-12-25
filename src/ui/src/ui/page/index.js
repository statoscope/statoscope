var Node = require('basis.ui').Node;

module.exports = Node.subclass({
    template: resource('./template/page.tmpl'),
    binding: {
        content: 'satellite:'
    }
});
