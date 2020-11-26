import assetsTree from './default/assets-tree';

export default function (discovery) {
  discovery.page.define('asset', [
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
                      $topLevelAssetChunks:chunks.[files has @];
                      $assetChunks: ($topLevelAssetChunks + $topLevelAssetChunks..children).[files has @];
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
