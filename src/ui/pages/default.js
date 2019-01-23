export default function (discovery) {
  discovery.definePage('default', [
    'h1:#.name',
    {
      view: 'block',
      className: 'totals',
      data: [
        {title: 'Files', query: 'input.files'},
        {title: 'Chunks', query: 'output.chunks'}
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
  ]);
}
