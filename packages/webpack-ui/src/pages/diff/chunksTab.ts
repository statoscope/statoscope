import { ViewConfigData } from '@statoscope/types';
import { diffBadges } from './helpers';

export default function chunksTab(): ViewConfigData[] {
  return [
    {
      view: 'tree',
      data: `
      $changed: chunks.changed.[chunk.chunkName()~=#.filter];
      $added: chunks.added.[chunk.chunkName()~=#.filter];
      $removed: chunks.removed.[chunk.chunkName()~=#.filter];
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
              'chunk-item:{chunk, hash, compact: true, inline: true, match: #.filter}',
              diffBadges(),
            ],
          },
        },
      },
    },
  ];
}
