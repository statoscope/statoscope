import { StatoscopeWidget } from '../../types';
import assetTree from '../pages/default/assets-tree';
import chunkTree from '../pages/default/chunks-tree';
import entryTree from '../pages/default/entry-tree';
import moduleTree from '../pages/default/modules-tree';
import packageTree, { packageInstanceTree } from '../pages/default/packages-tree';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('validation-related', (el, config, data?: unknown, context?) => {
    discovery.view.render(
      el,
      {
        view: 'tree',
        expanded: false,
        data: '.group(<type>).({type: key, items: value})',
        itemConfig: {
          content: 'text:type',
          children: 'items',
          itemConfig: {
            view: 'switch',
            content: [
              {
                when: 'type="module"',
                data: 'id.resolveModule(#.params.hash)',
                content: {
                  ...moduleTree(),
                },
              },
              {
                when: 'type="entry"',
                data: 'id.resolveEntrypoint(#.params.hash)',
                content: {
                  ...entryTree(),
                },
              },
              {
                when: 'type="chunk"',
                data: 'id.resolveChunk(#.params.hash)',
                content: {
                  ...chunkTree(),
                },
              },
              {
                when: 'type="resource"',
                data: 'id.resolveAsset(#.params.hash)',
                content: {
                  ...assetTree(),
                },
              },
              {
                when: 'type="compilation"',
                data: 'id.resolveStat()',
                content: {
                  view: 'link',
                  data: `{
                    href: pageLink("default", {hash:compilation.hash}),
                    text: statName(),
                  }
                  `,
                },
              },
              {
                when: 'type="package"',
                data: 'id.resolvePackage(#.params.hash)',
                content: {
                  ...packageTree(),
                },
              },
              {
                when: 'type="package-instance"',
                data: `
                  $nodeModule: id.nodeModule();
                  $package: $nodeModule.name.resolvePackage(#.params.hash);
                  $instance: $package.instances
                    .[path=$nodeModule.path]
                    .pick();
                  {
                    $package,
                    $instance
                  }`,
                content: {
                  ...packageInstanceTree(),
                },
              },
            ],
          },
        },
      },
      data,
      context
    );
  });
}
