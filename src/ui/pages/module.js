export default function (discovery) {
  discovery.definePage('module', [
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
            { view: 'badge', when: 'isEntry', data: '{ text: "entry", color: "#ffc107" }' },
            'badge:{ text: type, color: type.color() }',
            {
              view: 'badge',
              when: 'file',
              data: '{ text: file.ext, color: file.ext.fileType().color()} '
            },
            { view: 'badge', when: 'file', data: '{ text: "resource size: " + file.size.formatSize() }' },
            'badge:{ text: "bundled size: " + size.formatSize() }',
            {
              view: 'h1',
              content: 'text: "Module: " + (file.path or id)'
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
              content: 'module-item:{ module: $, match: #.filter }'
            },
            {
              view: 'section',
              header: 'text:"Links"',
              content: {
                view: 'tabs',
                name: 'linksTabs',
                tabs: [
                  {
                    value: 'dependencies',
                    content: ['text:"Dependencies"']
                  },
                  {
                    value: 'dependant',
                    content: ['text:"Dependants"']
                  },
                  {
                    value: 'chunks',
                    content: ['text:"Chunks"']
                  },
                  {
                    value: 'concatenated',
                    content: ['text:"Concatenated"']
                  },
                ],
                content: {
                  view: 'content-filter',
                  content: {
                    view: 'switch',
                    content: [
                      {
                        when: '#.linksTabs="dependencies"',
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
                          limit: 15,
                          item: 'module-item:{ module: $, match: #.filter }'
                        }
                      },
                      {
                        when: '#.linksTabs="dependant"',
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
                          limit: 15,
                          item: 'module-item:{ module: $, match: #.filter }'
                        }
                      },
                      {
                        when: '#.linksTabs="chunks"',
                        content: {
                          view: 'ul',
                          data: `chunks.[
                            no #.filter or 
                            (
                              $.name and
                              $.name~=#.filter or
                              not $.name and
                              $.id~=#.filter
                            )
                          ]`,
                          limit: 15,
                          item: {
                            view: 'link',
                            data: `{
                              href:"#chunk:" + id.encodeURIComponent(),
                              text: name or (id + (reason and (" [" + reason + "]") or "")),
                              match: #.filter
                            }`,
                            content: 'text-match'
                          }
                        }
                      },
                      {
                        when: '#.linksTabs="concatenated"',
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
                          limit: 15,
                          item: 'module-item:{ module: $, match: #.filter }'
                        }
                      }
                    ]
                  }
                }
              }
            },
            {
              view: 'section',
              header: 'text:"Messages"',
              content: {
                view: 'tabs',
                name: 'messagesTabs',
                tabs: [
                  { value: 'warnings', text: 'Warnings' },
                  { value: 'errors', text: 'Errors' },
                  { value: 'deopts', text: 'Deoptimizations' },
                ],
                content: {
                  view: 'content-filter',
                  content: {
                    view: 'switch',
                    content: [
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
