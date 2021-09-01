import { ViewConfigData } from '@statoscope/types';

export default function modulesDupsTab(): ViewConfigData[] {
  return [
    {
      view: 'tree',
      data: `
      $added: modulesDups.added.[module.resolvedResource~=#.filter];
      $removed: modulesDups.removed.[module.resolvedResource~=#.filter];
      [{
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
            children: 'dupModules.({item: $, hash: @.hash})',
            content: ['module-item:{module, hash, match: #.filter}'],
            itemConfig: {
              children: false,
              content: [
                'module-item:{module: item.module, hash, compact: true, inline: true}',
                {
                  view: 'badge',
                  className: 'hack-badge-margin-left',
                  data: `{text: item.instance.name}`,
                },
              ],
            },
          },
        },
      },
    },
  ];
}
