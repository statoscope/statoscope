var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var type = require('app.type');

function createMatcherSatellite(config) {
    return {
        existsIf: config.existsIf,
        dataSource: config.dataSource,
        instance: Node.subclass({
            type: config.type,
            autoDelegate: true,
            template: resource('./template/matcher/list.tmpl'),
            childClass: {
                template: resource('./template/matcher/item.tmpl'),
                binding: {
                    type: 'data:',
                    content: 'data:',
                    flags: 'data:'
                }
            },
            binding: {
                type: 'type'
            }
        })
    };
}

module.exports = new Page({
    delegate: type.Source,
    satellite: {
        content: {
            instance: Node.subclass({
                autoDelegate: true,
                template: resource('./template/list.tmpl'),
                dataSource: Value.query('data.profile.data.loaderDescriptors'),
                grouping: {
                    rule: 'data.type',
                    childClass: {
                        template: resource('./template/group.tmpl'),
                        binding: {
                            title: 'data:'
                        }
                    }
                },
                childClass: {
                    template: resource('./template/item.tmpl'),
                    satellite: {
                        test: createMatcherSatellite({
                            type: 'test',
                            existsIf: Value.query('data.test.itemCount'),
                            dataSource: Value.query('data.test')
                        }),
                        exclude: createMatcherSatellite({
                            type: 'exclude',
                            existsIf: Value.query('data.exclude.itemCount'),
                            dataSource: Value.query('data.exclude')
                        }),
                        include: createMatcherSatellite({
                            type: 'include',
                            existsIf: Value.query('data.include.itemCount'),
                            dataSource: Value.query('data.include')
                        }),
                        loaders: {
                            dataSource: Value.query('data.loaders'),
                            instance: Node.subclass({
                                template: resource('./template/loader/list.tmpl'),
                                childClass: {
                                    template: resource('./template/loader/item.tmpl'),
                                    binding: {
                                        path: 'data:pathShorten',
                                        hasQuery: Value.query('data.query').as(function(query) {
                                            return Object.keys(query).length;
                                        }),
                                        query: Value.query('data.query').as(function(query) {
                                            query = query || {};

                                            // todo colorize and beautify
                                            return JSON.stringify(query, null, 2);
                                        })
                                    }
                                }
                            })
                        }
                    },
                    binding: {
                        test: 'satellite:',
                        include: 'satellite:',
                        exclude: 'satellite:',
                        loaders: 'satellite:'
                    }
                }
            })
        }
    }
});
