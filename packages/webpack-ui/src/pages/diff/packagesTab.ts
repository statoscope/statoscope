import { ViewConfigData } from '@statoscope/types';
import { diffBadges } from './helpers';

export default function packagesTab(): ViewConfigData[] {
  return [
    {
      view: 'list',
      data: `
      $changed: packages.changed.[package.name~=#.filter];
      $added: packages.added.[package.name~=#.filter];
      $removed: packages.removed.[package.name~=#.filter];
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
            $package:package;
            $hash:hash;
            [{
              type: "changed",
              title: "Changed",
              visible: instances.changed.diff,
              data: instances.changed.({...$, package: $package, hash: $hash})
            },
            {
              type: "added",
              title: "Added",
              visible: instances.added,
              data: instances.added.({package: $package, hash: $hash, instance: $})
            },
            {
              type: "removed",
              title: "Removed",
              visible: instances.removed,
              data: instances.removed.({package: $package, hash: $hash, instance: $})
            }].[visible]`,
            content: [
              'package-item:{package, hash, compact: true, inline: true, match: #.filter}',
              {
                view: 'badge',
                className: 'hack-badge-margin-left',
                when: 'instances.added.size() or instances.removed.size()',
                data: `
                $added: instances.added.size() ? "+" + instances.added.size() : '';
                $removed: instances.removed.size() ? "-" + instances.removed.size() : '';
                {
                  text: $added + ($added and $removed ? '/' : '') + $removed,
                  postfix: 'instances'
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
                    view: 'link',
                    data: `{
                      text: instance.path,
                      href: package.name.pageLink("package", {instance: instance.path, hash}),
                      match: package.name
                    }`,
                    content: 'text-match',
                  },
                  {
                    view: 'badge',
                    className: 'hack-badge-margin-left',
                    when: 'instance.info.version',
                    data: `{text: instance.info.version}`,
                  },
                  diffBadges(),
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
