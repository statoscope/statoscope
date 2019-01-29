import styles from './default.css';

console.log(styles);

export default function (discovery) {
  discovery.definePage('default', [
    'h1:#.name',
    {
      view: 'block',
      className: styles.root,
      content: [
        {
          view: 'section',
          header: 'text:"Input"',
          data: [
            { title: 'Modules', query: 'input.modules', pageRef: 'modules' },
            { title: 'Files', query: 'input.files', pageRef: 'files' },
            { title: 'Entries', query: 'input.entries', pageRef: 'entries' },
          ],
          content: {
            view: 'inline-list',
            item: 'indicator',
            data: `.({
              label: title,
              value: query.query(#.data, #).size(),
              href: "#" + pageRef
            })`
          }
        },
        {
          view: 'section',
          header: 'text:"Output"',
          data: [
            { title: 'Chunks', query: 'output.chunks', pageRef: 'chunks' },
            { title: 'Chunk groups', query: 'output.chunkGroups', pageRef: 'chunkGroups' },
            { title: 'Assets', query: 'output.files', pageRef: 'assets' },
            { title: 'Messages', query: 'errors + warnings + input.modules.deopt', pageRef: 'messages' }
          ],
          content: {
            view: 'inline-list',
            item: 'indicator',
            data: `.({
            label: title,
            value: query.query(#.data, #).size(),
            href: "#" + pageRef
        })`
          }
        },
      ]
    },
    {
      view: 'block',
      className: styles.root,
      content: [
        {
          view: 'section',
          header: 'text:"Heaviest modules"',
          content: {
            view: 'tabs',
            name: 'heaviestModulesTabs',
            tabs: [
              { value: 'file', text: 'By file size' },
              { value: 'bundled', text: 'By bundled size' }
            ],
            content: {
              view: 'content-filter',
              content: {
                view: 'switch',
                content: [
                  {
                    when: '#.heaviestModulesTabs="file"',
                    data: `
                    data.input.modules.[file and (no #.filter or file.path~=#.filter)].sort(<file.size>).reverse()
                    `,
                    content: {
                      view: 'list',
                      limit: 10,
                      item: {
                        view: 'module-item',
                        className: styles['heaviest-item'],
                        data: `{
                          module: $, 
                          showType: false, 
                          showFileSize: true,
                          match: #.filter
                        }`
                      }
                    }
                  },
                  {
                    when: '#.heaviestModulesTabs="bundled"',
                    data: `
                    data.input.modules.[
                      no #.filter or 
                      file and file.path~=#.filter or id~=#.filter
                    ].sort(<size>).reverse()
                    `,
                    content: {
                      view: 'list',
                      limit: 10,
                      item: {
                        view: 'module-item',
                        className: styles['heaviest-item'],
                        data: `{
                          module: $, 
                          showType: false, 
                          showBundledSize: true,
                          match: #.filter
                        }`
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
          header: 'text:"Heaviest chunks"',
          content: {
            view: 'tabs',
            name: 'heaviestChunksTabs',
            tabs: [
              { value: 'assets', text: 'By assets size' },
              { value: 'modules', text: 'By modules amount' }
            ],
            content: {
              view: 'content-filter',
              content: {
                view: 'switch',
                content: [
                  {
                    when: '#.heaviestChunksTabs="assets"',
                    data: `
                    data.output.chunks.[
                      no #.filter or 
                      (
                        name and
                        name~=#.filter or
                        not name and
                        id~=#.filter
                      )
                    ].sort(<$.getTotalFilesSize()>).reverse()
                    `,
                    content: {
                      view: 'list',
                      limit: 10,
                      item: {
                        view: 'chunk-item',
                        className: styles['heaviest-item'],
                        data: `{
                          chunk: $, 
                          showSize: true,
                          match: #.filter
                        }`
                      }
                    }
                  },
                  {
                    when: '#.heaviestChunksTabs="modules"',
                    data: `
                    data.output.chunks.[
                      no #.filter or 
                      (
                        name and
                        name~=#.filter or
                        not name and
                        id~=#.filter
                      )
                    ].sort(<modules.size()>).reverse()
                    `,
                    content: {
                      view: 'list',
                      limit: 10,
                      item: {
                        view: 'chunk-item',
                        className: styles['heaviest-item'],
                        data: `{
                          chunk: $, 
                          showModulesAmount: true,
                          match: #.filter
                        }`
                      }
                    }
                  }
                ]
              }
            }
          }
        },
      ]
    }
  ]);
}
