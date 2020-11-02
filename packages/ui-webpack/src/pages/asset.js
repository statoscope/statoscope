import assetsTree from './default/assets-tree';

export default function (discovery) {
  discovery.page.define('asset', [
    {
      when: 'not __validation.result',
      view: 'alert-danger',
      data: `__validation.message`,
    },
    {
      view: 'switch',
      data: `#.data.assets.[name=#.id.decodeURIComponent()][0]`,
      content: [
        {
          when: 'not $',
          content: 'alert-warning:"Asset `" + #.id.decodeURIComponent() + "` not found"',
        },
        {
          content: [
            {
              view: 'h1',
              content: [
                'text:"Asset"',
                {
                  view: 'badge',
                  className: 'hack-badge-margin-left',
                  data: '{ text: name }',
                },
              ],
            },
            {
              ...assetsTree(),
            },
            {
              view: 'foam-tree',
              data: `
              $topLevelAssetChunks:chunks.(resolveChunk()).[files has @.name];
              $assetChunks: ($topLevelAssetChunks + $topLevelAssetChunks..(children.(resolveChunk()))).[files has @.name];
              $assetChunks.modules.[not shouldHideModule()].modulesToFoamTree()
              `,
            },
          ],
        },
      ],
    },
  ]);
}
