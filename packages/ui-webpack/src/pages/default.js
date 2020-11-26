import diffIndicatorStyle from '../views/diff-indicator.css';

import packagesTree from './default/packages-tree';
import modulesTree, { moduleItemConfig } from './default/modules-tree';
import chunksTree from './default/chunks-tree';
import entryTree from './default/entry-tree';
import assetsTree from './default/assets-tree';

export default function (discovery) {
  discovery.page.define('default', [
    {
      data: '#.params.hash.resolveCompilation()',
      view: 'switch',
      content: [
        {
          when: 'not $',
          content: 'stats-list',
        },
        {
          when: '$',
          content: [
            {
              when: 'not validation.result',
              view: 'alert-danger',
              data: `validation.message`,
            },
            {
              view: 'page-header',
              prelude: [
                {
                  when: 'fileName',
                  view: 'badge',
                  data: `{ prefix: 'file name', text: fileName }`,
                },
                {
                  when: 'name',
                  view: 'badge',
                  data: `{ prefix: 'name', text: name }`,
                },
                {
                  when: 'builtAt',
                  view: 'badge',
                  data: `{ prefix: 'date', text: builtAt.formatDate() }`,
                },
                {
                  when: 'hash',
                  view: 'badge',
                  data: `{prefix:'hash',text:hash}`,
                },
              ],
              content: 'h1:#.name',
            },
            {
              view: 'block',
              data: `
              $statA: #.params.hash.resolveCompilation();
              
              $getSize: => (
                $chunks: data.chunks + data.chunks..children;
                $assets: $chunks.files;
                $assets.size.reduce(=> $ + $$, 0)
              );
              $getInitialSize: => (
                $chunks: data.chunks.[initial];
                $assets: $chunks.files;
                $assets.size.reduce(=> $ + $$, 0)
              );
              
              [
                {
                  $totalSizeA: $statA.entrypoints.($getSize()).reduce(=> $ + $$, 0);
                  value: $totalSizeA.formatSize(),
                  label: "Total size"
                },
                {
                  $initialSizeA: $statA.entrypoints.($getInitialSize()).reduce(=> $ + $$, 0);
                  value: $initialSizeA.formatSize(),
                  label: 'Initial size'
                },
                {
                  $packagesSizeA: $statA.nodeModules.instances.modules.size.reduce(=> $ + $$, 0);
                  value: $packagesSizeA.formatSize(),
                  label: 'Packages size'
                },
                {
                  value: $statA.time.formatDuration(),
                  label: 'Build Time'
                },
                {
                  value: $statA.entrypoints.size(),
                  label: 'Entrypoints'
                },
                {
                  value: ($statA..modules).size(),
                  label: 'Modules'
                },
                {
                  $duplicates: $statA.(..modules).[source].group(<source>)
                    .({source: key, duplicates: value})
                    .[duplicates.size() > 1].(
                      $module: duplicates[0];
                      $dups: duplicates - [duplicates[0]];
                      {
                        module: $module,
                        duplicates: $dups
                      }
                    );
                  value: $duplicates.module.size(),
                  label: 'Duplicate modules'
                },
                {
                  value: ($statA.chunks + $statA.chunks..children).size(),
                  label: 'Chunks'
                },
                {
                  value: $statA.assets.size(),
                  label: 'Assets'
                },
                {
                  value: $statA.nodeModules.size(),
                  label: 'Packages'
                },
                {
                  value: (
                    $packagesWithMultipleInstancesA: $statA.nodeModules.[instances.size() > 1];
                    $copiesA: $packagesWithMultipleInstancesA.instances.size() - $packagesWithMultipleInstancesA.size();
                    $copiesA
                  ),
                  label: 'Package copies'
                },
              ]
              `,
              content: {
                view: 'inline-list',
                item: {
                  view: 'indicator',
                  className: diffIndicatorStyle.root,
                },
              },
            },
            {
              view: 'block',
              content: [
                {
                  view: 'section',
                  header: 'text:"Instant lists"',
                  content: {
                    view: 'tabs',
                    name: 'instantLists',
                    tabs: [
                      { value: 'entrypoints', text: 'Entrypoints' },
                      { value: 'modules', text: 'Modules' },
                      { value: 'modules-dups', text: 'Duplicate modules' },
                      { value: 'chunks', text: 'Chunks' },
                      { value: 'assets', text: 'Assets' },
                      { value: 'packages', text: 'Packages' },
                    ],
                    content: {
                      view: 'content-filter',
                      content: {
                        view: 'switch',
                        content: [
                          {
                            when: '#.instantLists="modules"',
                            data: `
                            modules.[not shouldHideModule()].[
                              name~=#.filter or modules and modules.[name~=#.filter]
                            ]
                            .sort(moduleSize() desc)
                            `,
                            content: {
                              ...modulesTree(),
                            },
                          },
                          {
                            when: '#.instantLists="modules-dups"',
                            data: `
                            $hash: hash;
                            (..modules).[
                              source and not shouldHideModule() and name~=#.filter
                            ].group(<source>)
                            .({source: key, duplicates: value})
                            .[duplicates.size() > 1].(
                              $module: duplicates[0];
                              $instance: $module.resolvedResource.nodeModule();
                              $package: $instance.name.resolvePackage($hash);
                              $dups: duplicates - [duplicates[0]];
                              $dupModules: $dups;
                              $dupPackages: $dups.(resolvedResource.nodeModule()).[].({
                                $path: path;
                                $resolvedPackage: name.resolvePackage($hash);
                                package: $resolvedPackage,
                                name: $resolvedPackage.name,
                                instances: $resolvedPackage.instances.[path = $path]
                              }).group(<name>).({name: key, instances: value.instances});
                              {
                                module: $module,
                                hash: $hash,
                                package: $package,
                                instance: $instance,
                                isLocal: not $module.resolvedResource.nodeModule(),
                                dupModules: $dupModules,
                                dupPackages: $dupPackages,
                                hasDupesInLocal: $dupModules.[not resolvedResource.nodeModule()].size() > 0
                              }
                            )
                            .sort(isLocal desc, instance.isRoot desc, dupModules.size() desc)
                            `,
                            content: {
                              view: 'tree',
                              expanded: false,
                              limitLines: '= settingListItemsLimit()',
                              itemConfig: {
                                content: [
                                  `module-item:{module, match: #.filter, inline: true}`,
                                  {
                                    view: 'badge',
                                    className: 'hack-badge-margin-left',
                                    data: `{text: dupModules.size(), postfix: dupModules.size().plural(['copy', 'copies'])}`,
                                  },
                                ],
                                children: 'dupModules',
                                itemConfig: moduleItemConfig(),
                              },
                            },
                          },
                          {
                            when: '#.instantLists="chunks"',
                            data: `
                            chunks.sort(initial desc, entry desc, size desc).[
                              chunkName()~=#.filter or id~=#.filter
                            ]
                            `,
                            content: {
                              ...chunksTree(),
                            },
                          },
                          {
                            when: '#.instantLists="assets"',
                            data: `
                            assets.[name~=#.filter]
                            .sort(isOverSizeLimit asc, size desc)
                            `,
                            content: {
                              ...assetsTree(),
                            },
                          },
                          {
                            when: '#.instantLists="entrypoints"',
                            data: `
                            entrypoints
                              .[name~=#.filter]
                              .sort(data.isOverSizeLimit asc, size desc)
                            `,
                            content: {
                              ...entryTree(),
                            },
                          },
                          {
                            when: '#.instantLists="packages"',
                            data: `
                            nodeModules
                              .[name~=#.filter]
                              .sort(instances.size() desc, name asc)
                            `,
                            content: {
                              ...packagesTree(),
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
}
