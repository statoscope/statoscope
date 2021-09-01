import { ViewConfigData } from '@statoscope/types';
import { diffBadges } from './helpers';

export default function assetsTab(): ViewConfigData[] {
  return [
    {
      view: 'tree',
      data: `
      $changed: assets.changed.[asset.name~=#.filter];
      $added: assets.added.[asset.name~=#.filter];
      $removed: assets.removed.[asset.name~=#.filter];
      [{
        type: "changed",
        title: "Changed",
        visible: $changed,
        data: $changed
      },
      {
        type: "added",
        title: "Added",
        visible: $added,
        data: $added
      },
      {
        type: "removed",
        title: "Removed",
        visible: $removed,
        data: $removed
      }].[visible]`,
      itemConfig: {
        view: 'tree',
        limitLines: '= settingListItemsLimit()',
        itemConfig: {
          content: [
            'text:title',
            {
              view: 'badge',
              className: 'hack-badge-margin-left',
              data: `{text: data.size()}`,
            },
          ],
          children: 'data',
          itemConfig: {
            children: false,
            content: [
              'asset-item:{asset, hash, compact: true, inline: true, match: #.filter}',
              diffBadges(),
            ],
          },
        },
      },
    },
  ];
}
