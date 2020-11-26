import entryTree from './default/entry-tree';

export default function (discovery) {
  discovery.page.define('entrypoint', [
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
              data: `entrypoints.[name=#.id.decodeURIComponent()][0]`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"Entrypoint `" + #.id.decodeURIComponent() + "` not found"',
                },
                {
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Entrypoint" }',
                      content: 'h1:name',
                    },
                    {
                      ...entryTree(),
                    },
                    {
                      view: 'tabs',
                      name: 'mapTabs',
                      tabs: [
                        { value: 'all', text: 'All chunks' },
                        { value: 'initial', text: 'Initial chunks' },
                        { value: 'async', text: 'Async chunks' },
                      ],
                      content: {
                        view: 'switch',
                        content: [
                          {
                            when: '#.mapTabs="all"',
                            content: {
                              view: 'foam-tree',
                              data: `
                              $topLevelChunks: data.chunks;
                              $chunks: $topLevelChunks + $topLevelChunks..children;
                              $chunkModules: $chunks.modules.[not shouldHideModule()];
                              $chunkModules.modulesToFoamTree()
                              `,
                            },
                          },
                          {
                            when: '#.mapTabs="initial"',
                            content: {
                              view: 'foam-tree',
                              data: `
                              $topLevelChunks: data.chunks;
                              $chunks: $topLevelChunks + $topLevelChunks..children;
                              $chunkModules: $chunks.[initial].modules.[not shouldHideModule()];
                              $chunkModules.modulesToFoamTree()
                              `,
                            },
                          },
                          {
                            when: '#.mapTabs="async"',
                            content: {
                              view: 'foam-tree',
                              data: `
                              $topLevelChunks: data.chunks;
                              $chunks: $topLevelChunks + $topLevelChunks..children;
                              $chunkModules: $chunks.[not initial].modules.[not shouldHideModule()];
                              $chunkModules.modulesToFoamTree()
                              `,
                            },
                          },
                        ],
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
