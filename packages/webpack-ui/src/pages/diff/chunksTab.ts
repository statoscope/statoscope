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
            children: `
            $chunk:chunk;
            $hash:hash;
            [{
              type: "changed",
              title: "Changed",
              visible: modules.changed.diff,
              data: modules.changed.({chunk: $chunk, hash: $hash, module: $})
            },
            {
              type: "added",
              title: "Added",
              visible: modules.added,
              data: modules.added.({chunk: $chunk, hash: $hash, module: $})
            },
            {
              type: "removed",
              title: "Removed",
              visible: modules.removed,
              data: modules.removed.({chunk: $chunk, hash: $hash, module: $})
            }].[visible]`,
            content: [
              'chunk-item:{chunk, hash, compact: true, inline: true, match: #.filter}',
              diffBadges(),
              {
                view: 'badge',
                className: 'hack-badge-margin-left',
                when: 'modules.added.size() or modules.removed.size()',
                data: `
                $added: modules.added.size() ? "+" + modules.added.size() : '';
                $removed: modules.removed.size() ? "-" + modules.removed.size() : '';
                {
                  text: $added + ($added and $removed ? '/' : '') + $removed,
                  postfix: 'modules'
                }`,
              },
            ],
            itemConfig: {
              children: 'data',
              content: [
                'text:title',
                {
                  view: 'badge',
                  className: 'hack-badge-margin-left',
                  data: `{text: data.size()}`,
                },
              ],
              itemConfig: {
                content: [
                  {
                    view: 'module-item',
                    data: `{
                      module,
                      hash,
                      match: #.filter
                    }`,
                  },
                ],
                children: false,
              },
            },
          },
        },
      },
    },
  ];
}
