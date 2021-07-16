import { ViewConfigData } from '@statoscope/types';
import { diffBadges } from './helpers';

export default function entriesTab(): ViewConfigData[] {
  return [
    {
      view: 'tree',
      data: `
      $changed: entries.changed.[entry.name~=#.filter];
      $added: entries.added.[entry.name~=#.filter];
      $removed: entries.removed.[entry.name~=#.filter];
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
              'entry-item:{entrypoint: entry, hash, compact: true, inline: true, match: #.filter}',
              diffBadges(),
            ],
          },
        },
      },
    },
  ];
}
