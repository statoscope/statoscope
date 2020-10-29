import entryTree from './default/entry-tree';

export default function (discovery) {
  discovery.page.define('entrypoint', (el, data, content) => {
    // el.classList.add(styles.root);
    discovery.view.render(
      el,
      [
        {
          view: 'switch',
          data: `#.data.entrypoints.entries().({name:key,data:value}).[name=#.id.decodeURIComponent()][0]`,
          content: [
            {
              when: 'not $',
              content:
                'alert-warning:"Entrypoint `" + #.id.decodeURIComponent() + "` not found"',
            },
            {
              content: [
                {
                  view: 'h1',
                  //className: styles.header,
                  content: [
                    'text:"Entrypoint"',
                    {
                      view: 'badge',
                      className: 'hack-badge-margin-left',
                      data: '{ text: name }',
                    },
                  ],
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
                            $topLevelChunks:data.chunks.(resolveChunk());
                            $chunks:($topLevelChunks + $topLevelChunks..(children.(resolveChunk())));
                            $chunkModules:$chunks.modules.identifier.(resolveModule()).[not shouldHideModule()];
                            $chunkModules.modulesToFoamTree()
                            `,
                        },
                      },
                      {
                        when: '#.mapTabs="initial"',
                        content: {
                          view: 'foam-tree',
                          data: `
                            $topLevelChunks:data.chunks.(resolveChunk());
                            $chunks:($topLevelChunks + $topLevelChunks..(children.(resolveChunk())));
                            $chunkModules:$chunks.[initial].modules.identifier.(resolveModule()).[not shouldHideModule()];
                            $chunkModules.modulesToFoamTree()
                            `,
                        },
                      },
                      {
                        when: '#.mapTabs="async"',
                        content: {
                          view: 'foam-tree',
                          data: `
                            $topLevelChunks:data.chunks.(resolveChunk());
                            $chunks:($topLevelChunks + $topLevelChunks..(children.(resolveChunk())));
                            $chunkModules:$chunks.[not initial].modules.identifier.(resolveModule()).[not shouldHideModule()];
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
      data,
      content
    );
  });
}
