var entity = require('basis.entity');
var type = require('basis.type');
var Loader = require('./loader');
var LoaderDescriptorMatcher = require('./loaderDescriptorMatcher');

var LoaderDescriptor = entity.createType('LoaderDescriptor', {
    type: type.enum(['loader', 'pre', 'post']).default('loader'),
    test: entity.createSetType(LoaderDescriptorMatcher),
    exclude: entity.createSetType(LoaderDescriptorMatcher),
    include: entity.createSetType(LoaderDescriptorMatcher),
    loaders: entity.createSetType(Loader)
});

module.exports = LoaderDescriptor;
