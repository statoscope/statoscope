var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var Page = require('app.ui').Page;
var type = require('app.type');

module.exports = new Page({
    className: 'Page.Env',
    satellite: {
        content: {
            delegate: type.Env,
            instance: Node.subclass({
                template: resource('./template/env.tmpl'),
                binding: {
                    evnName: Value.query('data.name'),
                    filePath: Value.query('data.file.data.name'),
                    reasons: 'satellite:'
                },
                satellite: {
                    reasons: {
                        dataSource: Value.query('data.module.data.reasons'),
                        instance: Node.subclass({
                            template: resource('./template/reason/list.tmpl'),
                            childClass: {
                                template: resource('./template/reason/item.tmpl'),
                                binding: {
                                    moduleName: Value.query('data.module.data.name'),
                                    startLine: Value.query('data.loc.data.start.data.line'),
                                    startColumn: Value.query('data.loc.data.start.data.column'),
                                    endLine: Value.query('data.loc.data.end.data.line'),
                                    endColumn: Value.query('data.loc.data.end.data.column')
                                },
                                action: {
                                    openFile: function(e) {
                                        var fileName = this.data.module.data.resource.data.name;
                                        var range = {
                                            start: {
                                                line: this.data.loc.data.start.data.line,
                                                column: this.data.loc.data.start.data.column
                                            },
                                            end: {
                                                line: this.data.loc.data.end.data.line,
                                                column: this.data.loc.data.end.data.column
                                            }
                                        };

                                        e.die();
                                        type.Env.openFile(fileName, [range]);
                                    }
                                }
                            }
                        })
                    }
                }
            })
        }
    }
});
