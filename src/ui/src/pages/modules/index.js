var Node = require('basis.ui').Node;

module.exports = new Node({
    active: basis.PROXY,
    template: resource('./template/page.tmpl'),
    satellite: {
        content: {
            instance: require('../../modules/modules/index'),
            delegate: 'delegate'
        }
    },
    binding: {
        content: 'satellite:'
    }
});
