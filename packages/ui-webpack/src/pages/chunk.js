import chunksTree from './default/chunks-tree';

export default function (discovery) {
  discovery.page.define('chunk', [
    {
      data: '#.params.hash.resolveCompilation()',
      view: 'switch',
      content: [
        {
          when: 'not $',
          content: 'stats-list',
        },
        {
          when: '$',
          content: [
            {
              when: 'not validation.result',
              view: 'alert-danger',
              data: `validation.message`,
            },
            {
              view: 'switch',
              data: `chunks.[(''+id)=#.id.decodeURIComponent()][0]`,
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
