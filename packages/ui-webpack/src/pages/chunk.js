import chunksTree from './default/chunks-tree';

export default function (discovery) {
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
              when: 'not file.validation.result',
              view: 'alert-danger',
              content: ['h3: "Stats is invalid"', 'md: file.validation.message'],
            },
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
                      view: 'foam-tree',
                      data: `
                      $chunkModules:modules.[not shouldHideModule()];
                      $chunkModules.modulesToFoamTree()
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
