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
        { title: 'Entrypoints', query: 'input.entries' },
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
          header: [
            'text:"Biggest modules"',
            'text:"("',
            {
              view: 'checkbox',
              content: 'text:"bundled"',
              name: 'byBundled'
            },
            'text:")"'
          ],
          data: `
          #.byBundled and
          data.input.modules.[file].sort(<size>).reverse() or
          data.input.modules.[file].sort(<file.size>).reverse()
          `,
          content: {
            view: 'ul',
            item: `module-item:{
              module: $, 
              showType: false, 
              showFileSize: no #.byBundled, 
              showBundledSize: #.byBundled
            }`
          }
        },
        {
          view: 'section',
          header: 'text:"Reports"',
          content: {
            view: 'ul',
            item: 'link:{ text: title, href: $.reportLink() }'
          },
          data: [
            {
              title: 'Input files',
              query: 'data.input.files',
              view: '"table"'
            }
          ]
        }
      ]
    }
  ]);
}
