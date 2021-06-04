import { StatoscopeWidget } from '../../types';
import assetsTree from './default/assets-tree';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('asset', [
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
              data: `compilation.assets.[name=#.id.decodeURIComponent()][0]`,
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
