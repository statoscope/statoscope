import styles from './default.css';

console.log(styles);

export default function (discovery) {
  discovery.definePage('default', [
    'h1:#.name',
    {
      view: 'block',
      className: 'totals',
      data: [
        { title: 'Modules', query: 'input.modules' },
        { title: 'Files', query: 'input.files' },
        { title: 'Entries', query: 'input.entries' },
        { title: 'Messages', query: 'errors + warnings + input.modules.deopt' }
      ],
      content: {
        view: 'inline-list',
        item: 'indicator',
        data: `.({
            label: title,
            value: query.query(#.data, #).size()
            // href: { query, title }.reportLink()
        })`
      }
    },
    {
      view: 'block',
      className: 'totals',
      data: [
        { title: 'Chunks', query: 'output.chunks' },
        { title: 'Chunk groups', query: 'output.chunkGroups' },
        { title: 'Assets', query: 'output.files' },
      ],
      content: {
        view: 'inline-list',
        item: 'indicator',
        data: `.({
            label: title,
            value: query.query(#.data, #).size()
            // href: { query, title }.reportLink()
        })`
      }
    },
    {
      view: 'block',
      className: styles.root,
      content: [
        {
          view: 'section',
          header: 'text:"Biggest modules"',
          content: {
            view: 'tabs',
            name: 'biggestModulesTabs',
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
                    when: '#.biggestModulesTabs="file"',
                    data: `
                    data.input.modules.[file and (no #.filter or file.path~=#.filter)].sort(<file.size>).reverse()
                    `,
                    content: {
                      view: 'list',
                      item: {
                        view: 'module-item',
                        className: styles['biggest-modules-item'],
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
                    when: '#.biggestModulesTabs="bundled"',
                    data: `
                    data.input.modules.[
                      no #.filter or 
                      file and file.path~=#.filter or id~=#.filter
                    ].sort(<size>).reverse()
                    `,
                    content: {
                      view: 'list',
                      item: {
                        view: 'module-item',
                        className: styles['biggest-modules-item'],
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
          header: 'text:"Biggest Chunks"',
          content: {
            view: 'tabs',
            name: 'biggestChunksTabs',
            tabs: [
              { value: 'size', text: 'By size' },
              { value: 'modules', text: 'By modules amount' }
            ],
            content: {
              view: 'content-filter',
              content: {
                view: 'switch',
                content: [
                  {
                    when: '#.biggestChunksTabs="size"',
                    data: `
                    data.output.chunks.sort(<size>).reverse()
                    `,
                    content: {
                      view: 'list',
                      item: {
                        view: 'text',
                        className: styles['biggest-modules-item'],
                        data: `(name or (id + (reason and (" [" + reason + "]") or "")))`
                      }
                    }
                  },
                  {
                    when: '#.biggestChunksTabs="modules"',
                    data: `
                    data.input.modules.[
                      no #.filter or 
                      file and file.path~=#.filter or id~=#.filter
                    ].sort(<size>).reverse()
                    `,
                    content: {
                      view: 'list',
                      item: {
                        view: 'module-item',
                        className: styles['biggest-modules-item'],
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
      ]
    }
  ]);
}
