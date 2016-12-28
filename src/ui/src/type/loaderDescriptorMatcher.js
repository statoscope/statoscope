var entity = require('basis.entity');
var type = require('basis.type');

var LoaderDescriptorMatcher = entity.createType('LoaderDescriptorMatcher', {
    type: type.enum(['string', 'regexp']).default('string'),
    content: String,
    flags: String
});

module.exports = LoaderDescriptorMatcher;
