import { StatoscopeWidget } from '../../types';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('custom-report', [
    {
      view: 'switch',
      data: `#.id.customReports_getItem(#.params.file)`,
      content: [
        {
          when: 'not $',
          content:
            'alert-warning:"A custom report with ID `" #.id + "` in `" + #.params.file + "` was not found"',
        },
        {
          when: '$',
          content: [
            {
              view: 'page-header',
              prelude: [
                'badge:{ text: "Custom Report" }',
                'badge:{ prefix: "File", text: #.params.file }',
              ],
              content: {
                view: 'h1',
                data: `name`,
              },
            },
            {
              view: 'custom-view',
              data: '{view, data}',
            },
          ],
        },
      ],
    },
  ]);
}
