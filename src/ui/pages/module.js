import styles from './module.css';

export default function (discovery) {
  discovery.page.define('module', [
    {
      view: 'switch',
      data: 'data.input.modules.[id=#.id.decodeURIComponent()].pick()',
      content: [
        {
          when: 'no $',
          content: 'alert-warning:"Module `" + #.id.decodeURIComponent() + "` not found"'
        },
        {
          content: [
            { view: 'h1', className: styles.header, content: 'badge:{ text: type, color: type.color() }' },
            {
              view: 'h2', className: styles.header, content: [
                { view: 'badge', when: 'isEntry', data: '{ text: "entry", color: "#ffc107" }' },
                { view: 'badge', when: 'file', data: '{ prefix: "resource", text: file.size.formatSize() }' },
                'badge:{ prefix: "bundled", text: size.formatSize() }',
                {
                  view: 'badge',
                  when: 'file.nodeModule',
                  data: '{ color: "#9efb8e", prefix: file.nodeModule.name, text: file.nodeModule.version }'
                },
              ]
            },
            {
              view: 'h2',
              when: 'type != "MultiModule"',
              content: [
                {
                  view: 'badge',
                  when: 'file',
                  data: '{ text: file.ext, color: file.ext.fileType().color()} '
                },
                'text: file.path or id'
              ]
            },
            /* {
              view: 'section',
              header: 'text:"Raw data"',
              content: 'struct'
            },*/
            {
              view: 'section',
              when: 'extracted',
              data: 'extracted',
              header: 'text:"Extracted from"',
              content: 'module-item:{ module: $ }'
            },
            {
              view: 'block',
              className: styles.root,
              content: [
                {
                  view: 'section',
                  header: 'text:"Dependants"',
                  content: {
                    view: 'content-filter',
                    content: {
                      view: 'list',
                      data: `reasons.[
                        no #.filter or 
                        $.module.type~=#.filter or 
                        (
                          $.module.file and 
                          $.module.file.path~=#.filter or 
                          $.module.id~=#.filter
                        )
                      ].module`,
                      limit: 10,
                      item: {
                        view: 'module-item',
                        className: styles['module-item'],
                        data: `{
                          module: $, 
                          showType: false, 
                          showFileSize: true,
                          match: #.filter
                        }`
                      }
                    }
                  }
                },
                {
                  view: 'section',
                  header: 'text:"Dependencies"',
                  content: {
                    view: 'content-filter',
                    content: {
                      view: 'list',
                      data: `deps.[
                        no #.filter or 
                        $.module.type~=#.filter or 
                        (
                          $.module.file and 
                          $.module.file.path~=#.filter or 
                          $.module.id~=#.filter
                        )
                      ].module`,
                      limit: 10,
                      item: {
                        view: 'module-item',
                        className: styles['module-item'],
                        data: `{
                          module: $, 
                          showType: false, 
                          showFileSize: true,
                          match: #.filter
                        }`
                      }
                    }
                  }
                }
              ]
            },
            {
              view: 'block',
              className: styles.root,
              content: [
                {
                  view: 'section',
                  header: 'text:"Chunks"',
                  content: {
                    view: 'content-filter',
                    content: {
                      view: 'list',
                      data: `
                      chunks.[
                        no #.filter or 
                        (
                          name and
                          name~=#.filter or
                          not name and
                          id~=#.filter
                        )
                      ]
                      `,
                      limit: 10,
                      item: {
                        view: 'chunk-item',
                        className: styles['module-item'],
                        data: `{
                          chunk: $, 
                          showSize: true,
                          match: #.filter
                        }`
                      }
                    }
                  }
                },
                {
                  view: 'section',
                  when: 'concatenated',
                  header: 'text:"Concatenated"',
                  content: {
                    view: 'content-filter',
                    content: {
                      view: 'list',
                      data: `concatenated.[
                          no #.filter or 
                          $.type~=#.filter or 
                          (
                            $.file and 
                            $.file.path~=#.filter or 
                            $.id~=#.filter
                          )
                        ]`,
                      limit: 10,
                      item: 'module-item:{ module: $, match: #.filter }'
                    }
                  }
                }
              ]
            },


            {
              view: 'section',
              header:
                'text:"Messages"',
              content:
                {
                  view: 'tabs',
                  name:
                    'messagesTabs',
                  tabs:
                    [
                      { value: 'warnings', text: 'Warnings' },
                      { value: 'errors', text: 'Errors' },
                      { value: 'deopts', text: 'Deoptimizations' },
                    ],
                  content:
                    {
                      view: 'content-filter',
                      content:
                        {
                          view: 'switch',
                          content:
                            [
                              {
                                when: '#.messagesTabs="warnings"',
                                content: {
                                  view: 'ul',
                                  limit: 15,
                                  data: 'warnings.[no #.filter or $.message~=#.filter]',
                                  item: 'text-match:{ text: $.message, match: #.filter }'
                                }
                              },
                              {
                                when: '#.messagesTabs="errors"',
                                content: {
                                  view: 'ul',
                                  limit: 15,
                                  data: 'errors.[no #.filter or $.message~=#.filter]',
                                  item: 'text-match:{ text: $.message, match: #.filter }'
                                }
                              },
                              {
                                when: '#.messagesTabs="deopts"',
                                content: {
                                  view: 'ul',
                                  limit: 15,
                                  data: 'deopt.[no #.filter or $~=#.filter]',
                                  item: 'text-match:{ text: $, match: #.filter }'
                                }
                              }
                            ]
                        }
                    }
                }
            }
          ]
        }
      ]
    }
  ]);
}
