export default function (discovery) {
  discovery.definePage('asset', [
    {
      view: 'switch',
      data: 'data.output.files.[hash=#.id.decodeURIComponent()].pick()',
      content: [
        {
          when: 'no $',
          content: 'alert-warning:"Asset `" + #.id.decodeURIComponent() + "` not found"'
        },
        {
          content: [
            { view: 'badge', when: 'onlyInitial', data: '{ text: "onlyInitial", color: "#ffc107" }' },
            { view: 'badge', when: 'canBeInitial', data: '{ text: "canBeInitial", color: "#ffc107" }' },
            {
              view: 'h1',
              content: 'text: "Asset: " + path'
            },
            /* {
              view: 'section',
              header: 'text:"Raw data"',
              content: 'struct'
            },*/
            {
              view: 'badge',
              data: '{ text: ext, color: ext.fileType().color()} '
            },
            { view: 'badge', data: '{ text: "size: " + size.formatSize() }' },
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
                    value: 'chunks',
                    content: ['text:"Chunks"']
                  }
                ],
                content: {
                  view: 'content-filter',
                  content: {
                    view: 'switch',
                    content: [
                      {
                        when: '#.linksTabs="chunks"',
                        content: {
                          view: 'list',
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
