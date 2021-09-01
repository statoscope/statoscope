import { StatoscopeWidget } from '../../types';
import chunksTree from './default/chunks-tree';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('chunk', [
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
              data: `compilation.chunks.[(''+id)=#.id.decodeURIComponent()][0]`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"Chunk `" + #.id.decodeURIComponent() + "` not found"',
                },
                {
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Chunk" }',
                      content: 'h1:chunkName()',
                    },
                    {
                      ...chunksTree(),
                    },
                    {
                      view: 'section',
                      header: 'text:"Messages"',
                      content: {
                        view: 'tabs',
                        name: 'messagesTabs',
                        tabs: [{ value: 'validation', text: 'Validation' }],
                        content: {
                          view: 'content-filter',
                          content: {
                            view: 'switch',
                            content: [
                              {
                                when: '#.messagesTabs="validation"',
                                content: {
                                  view: 'validation-messages',
                                  data: `
                                  $messages: #.params.hash.validation_getItems('chunk', id);
                                  $related: {type: 'chunk', id};
                                  { $messages, $related, showRelated: false }
                                  `,
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                    {
                      view: 'foam-tree',
                      data: `
                      $chunkModules:modules.[not shouldHideModule()];
                      $chunkModules.modulesToFoamTree(#.params.hash)
                      `,
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
