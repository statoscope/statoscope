import styles from './module.css';

export default function (discovery) {
  discovery.page.define('file', [
    {
      view: 'switch',
      data: 'data.input.files.[path=#.id.decodeURIComponent()].pick()',
      content: [
        {
          when: 'no $',
          content: 'alert-warning:"File `" + #.id.decodeURIComponent() + "` not found"'
        },
        {
          content: [
            {
              view: 'h2', className: styles.header, content: [
                'badge:{ text: ext, color: ext.fileType().color()}',
                'badge:{ text: size.formatSize() }',
                {
                  view: 'badge',
                  when: 'nodeModule',
                  data: '{ color: "#9efb8e", prefix: nodeModule.name, text: nodeModule.version }'
                },
              ]
            },
            {
              view: 'h2',
              content: [
                'text: path'
              ]
            },
            /* {
              view: 'section',
              header: 'text:"Raw data"',
              content: 'struct'
            },*/
            {
              view: 'section',
              header: 'text:"Modules"',
              content: {
                view: 'content-filter',
                content: {
                  view: 'list',
                  data: `#.data.input.modules.[file.path=#.id.decodeURIComponent()].[
                        no #.filter or 
                        $.type~=#.filter or 
                        (
                          $.file and 
                          $.file.path~=#.filter or 
                          $.id~=#.filter
                        )
                      ]`,
                  limit: 10,
                  item: {
                    view: 'module-item',
                    className: styles['module-item'],
                    data: `{
                          module: $, 
                          match: #.filter
                        }`
                  }
                }
              }
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
                      #.data.input.modules.[file.path=#.id.decodeURIComponent()]
                      .chunks.[
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
                }
              ]
            }
          ]
        }
      ]
    }
  ]);
}
