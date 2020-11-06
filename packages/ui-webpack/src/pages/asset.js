import assetsTree from './default/assets-tree';

export default function (discovery) {
  discovery.page.define('asset', [
    {
      data: '#.params.hash.resolveStats()',
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
              when: 'not __validation.result',
              view: 'alert-danger',
              data: `__validation.message`,
            },
            {
              view: 'switch',
              data: `assets.[name=#.id.decodeURIComponent()][0]`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"Asset `" + #.id.decodeURIComponent() + "` not found"',
                },
                {
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Asset" }',
                      content: 'h1:name',
                    },
                    {
                      ...assetsTree(),
                    },
                    {
                      view: 'foam-tree',
                      data: `
                      $topLevelAssetChunks:chunks.(resolveChunk(#.params.hash)).[files has @.name];
                      $assetChunks: ($topLevelAssetChunks + $topLevelAssetChunks..(children.(resolveChunk(#.params.hash)))).[files has @.name];
                      $assetChunks.modules.[not shouldHideModule()].modulesToFoamTree()
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
