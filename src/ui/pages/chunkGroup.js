export default function (discovery) {
  discovery.definePage('chunkGroup', [
    {
      view: 'switch',
      data: 'data.output.chunkGroups.[id=#.id.decodeURIComponent()].pick()',
      content: [
        {
          when: 'no $',
          content: 'alert-warning:"Chunk group `" + #.id.decodeURIComponent() + "` not found"'
        },
        {
          content: [
            { view: 'badge', when: 'isInitial', data: '{ text: "isInitial", color: "#ffc107" }' },
            {
              view: 'h1',
              content: 'text: "Chunk group: " + (name or (id + " (without name)"))'
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
              header: 'text:"Entry module"',
              content: 'module-item:{ module: entryModule }'
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
                  },
                  {
                    value: 'children',
                    content: ['text:"Children"']
                  },
                  {
                    value: 'parents',
                    content: ['text:"Parents"']
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
                      },
                      {
                        when: '#.linksTabs="children"',
                        content: {
                          view: 'list',
                          data: `children.[
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
                              href:"#chunkGroup:" + id.encodeURIComponent(),
                              text: name or (id + " (without name)"),
                              match: #.filter
                            }`,
                            content: 'text-match'
                          }
                        }
                      },
                      {
                        when: '#.linksTabs="parents"',
                        content: {
                          view: 'list',
                          data: `parents.[
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
                              href: "#chunkGroup:" + id.encodeURIComponent(),
                              text: name or (id + " (without name)"),
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
