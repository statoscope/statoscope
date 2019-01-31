export default function (discovery) {
  discovery.page.define('chunk', [
    {
      view: 'switch',
      data: 'data.output.chunks.[id=#.id.decodeURIComponent().toNumber()].pick()',
      content: [
        {
          when: 'no $',
          content: 'alert-warning:"Chunk `" + #.id.decodeURIComponent() + "` not found"'
        },
        {
          content: [
            { view: 'badge', when: 'onlyInitial', data: '{ text: "onlyInitial", color: "#ffc107" }' },
            { view: 'badge', when: 'canBeInitial', data: '{ text: "canBeInitial", color: "#ffc107" }' },
            {
              view: 'h1',
              content: 'text: "Chunk: " + (name or (id + (reason and (" [" + reason + "]") or "")))'
            },
            /* {
              view: 'section',
              header: 'text:"Raw data"',
              content: 'struct'
            },*/
            {
              view: 'section',
              when: 'reason',
              data: 'reason',
              header: 'text:"Reason"',
            },
            {
              view: 'section',
              when: 'entryModule',
              data: 'entryModule',
              header: 'text:"Entry module"',
              content: 'module-item:{ module: $ }'
            },
            {
              view: 'section',
              header: 'text:"Links"',
              content: {
                view: 'tabs',
                name: 'linksTabs',
                tabs: [
                  {
                    value: 'modules',
                    content: ['text:"Modules"']
                  },
                  {
                    value: 'assets',
                    content: ['text:"Assets"']
                  },
                  {
                    value: 'groups',
                    content: ['text:"Groups"']
                  }
                ],
                content: {
                  view: 'content-filter',
                  content: {
                    view: 'switch',
                    content: [
                      {
                        when: '#.linksTabs="modules"',
                        content: {
                          view: 'list',
                          data: `modules.[
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
                      },
                      {
                        when: '#.linksTabs="assets"',
                        content: {
                          view: 'table',
                          data: `files.[
                            no #.filter or 
                            $.path~=#.filter
                          ]`,
                          cols: [
                            {
                              header: 'File',
                              content: [
                                {
                                  view: 'badge',
                                  data: '{ text: ext, color: ext.fileType().color()} '
                                },
                                {
                                  view: 'link',
                                  data: '{ href:"#asset:" + hash.encodeURIComponent(), text: path, match: #.filter }',
                                  content: 'text-match'
                                }
                              ]
                            },
                            {
                              header: 'Size',
                              content: 'text: size.formatSize()'
                            }
                          ],
                          limit: 15
                        }
                      },
                      {
                        when: '#.linksTabs="groups"',
                        content: {
                          view: 'ul',
                          data: `groups.[
                            no #.filter or 
                            (
                              $.name and
                              $.name~=#.filter or
                              not $.name and
                              $.id~=#.filter
                            )
                          ]`,
                          item: {
                            view: 'link',
                            data: `{
                              href:"#chunkGroup:" + id.encodeURIComponent(),
                              text: name or (id + " (without name)"),
                              match: #.filter
                            }`,
                            content: 'text-match'
                          },
                          limit: 15
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
                  { value: 'errors', text: 'Errors' }
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
