export default function (discovery) {
  discovery.page.define('deopts', [
    {
      view: 'content-filter',
      name: 'filter',
      content: {
        data: `data.input.modules.[
               deopt.size() and
               (
                 no #.filter or
                 file.path~=#.filter or 
                 deop.[$~=#.filter] or 
                 (no file.path and type~=#.filter)
               )
             ].sort(<file.path>)`,
        view: 'table',
        cols: [
          {
            header: 'File',
            content: {
              view: 'link',
              data: '{href:"#module:" + id.encodeURIComponent(), text: file.path or type, match: #.filter }',
              content: 'text-match'
            }
          },
          {
            header: 'Reasons',
            data: 'deopt',
            view: 'list',
            item: 'text-match:{ text: $, match: #.filter }'
          }
        ]
      }
    }
  ])
}
