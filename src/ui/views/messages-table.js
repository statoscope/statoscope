export default function (discovery) {
  discovery.view.define('messages-table', render);

  function render(el, config, data, context) {
    const { limit = 15 } = config;

    discovery.view.render(el, {
      view: 'table',
      limit: limit,
      data: `
      messages.[
        no #.filter or $.message~=#.filter or
        (
          $.from="asset" and $.source.path~=#.filter
          or
          $.from="chunk" and $.source.name~=#.filter
          or
          $.from="entrypoint" and $.source.name~=#.filter
          or
          $.from="module" and 
          (
            $.source.file ?
            $.source.file.path~=#.filter :
            $.source.id~=#.filter
          )
        ) 
      ]`,
      cols: [
        {
          header: 'Type',
          content: 'badge: { text: type, color: type.color() }'
        },
        {
          header: 'Ref',
          content: [
            'badge: { text: from, color: from.color() }',
            {
              view: 'switch',
              content: [
                {
                  when: 'from="asset"',
                  data: 'source',
                  content: [
                    {
                      view: 'link',
                      data: '{ href:"#asset:" + hash.encodeURIComponent(), text: $.path, match: #.filter }',
                      content: 'text-match'
                    }
                  ]
                },
                {
                  when: 'from="entrypoint"',
                  data: 'source',
                  content: [
                    {
                      view: 'link',
                      data: '{ href:"#bundle:" + $.name.encodeURIComponent(), text: $.name, match: #.filter }',
                      content: 'text-match'
                    }
                  ]
                },
                {
                  when: 'from="chunk"',
                  data: 'source',
                  content: [
                    {
                      view: 'link',
                      data: '{ href:"#chunk:" + $.id.encodeURIComponent(), text: $.name, match: #.filter }',
                      content: 'text-match'
                    }
                  ]
                },
                {
                  when: 'from="module"',
                  data: 'source',
                  content: 'module-item-inline:{ module: $, match: #.filter }'
                }
              ]
            }
          ]
        },
        {
          header: 'Message',
          content: {
            view: 'text-match',
            data: '{ text: $.message, match: #.filter }'
          }
        }
      ]
    }, data, context);
  }
}
