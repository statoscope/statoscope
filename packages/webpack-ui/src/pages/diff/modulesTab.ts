import { ViewConfigData } from '@statoscope/types';
import { moduleItemConfig } from '../default/modules-tree';

export default function modulesTab(): ViewConfigData[] {
  return [
    {
      view: 'tree',
      data: `
      $changed: modules.changed.[module.resolvedResource~=#.filter];
      $added: modules.added.[module.resolvedResource~=#.filter];
      $removed: modules.removed.[module.resolvedResource~=#.filter];
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
          itemConfig: moduleItemConfig('module', 'hash'),
        },
      },
    },
  ];
}
