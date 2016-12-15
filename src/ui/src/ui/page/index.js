var Node = require('basis.ui').Node;

module.exports = Node.subclass({
    active: basis.PROXY,
    template: resource('./template/page.tmpl'),
    binding: {
        content: 'satellite:'
    }
});
