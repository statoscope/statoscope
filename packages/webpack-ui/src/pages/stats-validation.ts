import { StatoscopeWidget } from '../../types';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('stats-validation', [
    {
      data: '#.params.hash.resolveStat()',
      view: 'switch',
      content: [
        {
          when: 'not compilation',
          content: 'stats-list',
        },
        {
          when: 'compilation',
          content: [
            {
              view: 'switch',
              data: `compilation.hash.validation_getItems()`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"The validation messages from `" + #.id.decodeURIComponent() + "` compilation was not found"',
                },
                {
                  content: [
                    {
                      view: 'page-header',
                      content: 'h1:"Validation messages"',
                    },
                    {
                      view: 'content-filter',
                      content: {
                        view: 'validation-messages',
                        data: `{messages: $}`,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
}
