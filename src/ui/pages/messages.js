export default function (discovery) {
  discovery.definePage('messages', {
    view: 'tabs',
    name: 'messagesTabs',
    tabs: [
      { value: 'warnings', text: 'Warnings' },
      { value: 'errors', text: 'Errors' },
      { value: 'deopts', text: 'Deoptimizations' },
    ],
    content: {
      view: 'content-filter',
      content: {
        view: 'switch',
        content: [
          {
            when: '#.messagesTabs="warnings"',
            data: '{ messages: data.warnings}',
            content: 'messages-table'
          },
          {
            when: '#.messagesTabs="errors"',
            data: '{ messages: data.errors}',
            content: 'messages-table'
          },
          {
            when: '#.messagesTabs="deopts"',
            content: {
              view: 'table',
              limit: 15,
              data: `data.input.modules.[
              deopt and
              (
                no #.filter or 
                $.type~=#.filter or 
                $.deopt~=#.filter or 
                (
                  $.file and 
                  $.file.path~=#.filter or 
                  $.id~=#.filter
                )
              )
            ].($module: $; deopt.({ module: $module, message: $ }))`,
              cols: [
                {
                  header: 'Module',
                  data: 'module',
                  content: 'module-item:{ module: $, match: #.filter }'
                },
                {
                  header: 'Message',
                  data: '{ text: $.message, match: #.filter }',
                  content: 'text-match'
                }
              ]
            }
          }
        ]
      }
    }
  });
}
