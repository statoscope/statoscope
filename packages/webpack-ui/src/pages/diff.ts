import { StatoscopeWidget, ViewConfigData } from '../../types';
// @ts-ignore
import styles from './diff.css';

function statsSelect(value: string, onChange: (value: string) => void): ViewConfigData {
  return {
    view: 'select',
    placeholder: 'choose a stat',
    value: value,
    text: `
    $stat: resolveStat();
    $stat ? ($stat.statName() + ' ' + $stat.compilation.builtAt.formatDate()) : "n/a"
    `,
    data: 'compilations.[not shouldHideCompilation()].hash',
    onChange,
  };
}

function sizeDiff(): ViewConfigData {
  return {
    view: 'badge',
    className: 'hack-badge-margin-left',
    data: `
    $diff: valueA - valueB;
    $diffPerc: valueA.percentFrom(valueB).toFixed();
    $inc: $diff > 0;
    $prefix: $inc ? '+' : '';
    {
      prefix: label,
      text: $prefix + $diff.formatSize(),
      postfix: $prefix + $diffPerc + '%',
      color: $inc ? 0.colorFromH() : 100.colorFromH(),
      hint: valueA.formatSize()
    }`,
  };
}

function entriesTab(): ViewConfigData[] {
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
              'entry-item:{entrypoint: entry, hash, showSize: false, inline: true, match: #.filter}',
              sizeDiff(),
            ],
          },
        },
      },
    },
  ];
}

function chunksTab(): ViewConfigData[] {
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
              'chunk-item:{chunk, hash, showSize: false, inline: true, match: #.filter}',
              sizeDiff(),
            ],
          },
        },
      },
    },
  ];
}

function assetsTab(): ViewConfigData[] {
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
              'asset-item:{asset, hash, showSize: false, inline: true, match: #.filter}',
              sizeDiff(),
            ],
          },
        },
      },
    },
  ];
}

function modulesTab(): ViewConfigData[] {
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
          itemConfig: {
            children: false,
            content: [
              'module-item:{module, hash, showSize: false, inline: true, match: #.filter}',
              sizeDiff(),
            ],
          },
        },
      },
    },
  ];
}

function modulesDupsTab(): ViewConfigData[] {
  return [
    {
      view: 'tree',
      data: `
      $added: moduleDups.added.[module.resolvedResource~=#.filter];
      $removed: moduleDups.removed.[module.resolvedResource~=#.filter];
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
            children: 'dupModules.({module: $, hash: @.hash})',
            content: ['module-item:{module, hash, showSize: true, match: #.filter}'],
            itemConfig: {
              children: false,
              content: ['module-item:{module, hash, showSize: true}'],
            },
          },
        },
      },
    },
  ];
}

function packagesTab(): ViewConfigData[] {
  return [
    {
      view: 'list',
      data: `
      $changed: packages.changed.[(package.a or package).name~=#.filter];
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
            $packageA:package.a or package;
            $packageB:package.b;
            $hashA: hashA or hash;
            $hashB: hashB;
            [{
              type: "added",
              title: "Added",
              visible: instances.added,
              data: instances.added
            },
            {
              type: "removed",
              title: "Removed",
              visible: instances.removed,
              data: instances.removed
            }].[visible]`,
            content: [
              'package-item:{package: package.a or package, hash, showInstancesTotal: false, inline: true, match: #.filter}',
              {
                view: 'badge',
                className: 'hack-badge-margin-left',
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

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('diff', [
    {
      view: 'page-header',
      content: 'h1:"Stats diff"',
      prelude: [
        {
          view: 'block',
          className: styles.root,
          content: [
            {
              view: 'block',
              content: [
                statsSelect('#.params.hash', (value: string): void => {
                  const context = discovery.getRenderContext();
                  const link = discovery.encodePageHash(context.page, context.id, {
                    ...context.params,
                    hash: value,
                  });
                  location.assign(link);
                }),
              ],
            },
            {
              view: 'link',
              className: styles.with,
              onClick(): void {
                const context = discovery.getRenderContext();
                const link = discovery.encodePageHash(context.page, context.id, {
                  ...context.params,
                  hash: context.params.diffWith,
                  diffWith: context.params.hash,
                });

                if (link) {
                  location.assign(link);
                }
              },
              data: `{text: '🔄', href: '#'}`,
            },
            {
              view: 'block',
              content: [
                statsSelect('#.params.diffWith', (value) => {
                  const context = discovery.getRenderContext();
                  const link = discovery.encodePageHash(context.page, context.id, {
                    ...context.params,
                    diffWith: value,
                  });
                  location.assign(link);
                }),
              ],
            },
          ],
        },
      ],
    },
    {
      when: `
      $statA: #.params.hash.resolveStat();
      $statB: #.params.diffWith.resolveStat();
      not ($statA and $statB)
      `,
      view: 'alert-warning',
      data: '"Choose two stats to compare"',
    },
    {
      when: `
      $statA: #.params.hash.resolveStat();
      $statB: #.params.diffWith.resolveStat();
      $statA and $statB
      `,
      view: 'block',
      data: `
      $statA: #.params.hash.resolveStat();
      $statB: #.params.diffWith.resolveStat();
      
      $statsACompressed: $statA.file.__statoscope.compilations.modules.source.sizes.[compressor].size();
      $statsBCompressed: $statB.file.__statoscope.compilations.modules.source.sizes.[compressor].size();
      $useCompressedSize: settingShowCompressed() and $statsACompressed and $statsBCompressed;
      
      $getSize: => (
        $chunks: data.chunks + data.chunks..children;
        $assets: $chunks.files;
        $assets.(getAssetSize($$.hash, $$.use).size).reduce(=> $ + $$, 0)
      );
      $getInitialSize: => (
        $chunks: data.chunks.[initial];
        $assets: $chunks.files;
        $assets.(getAssetSize($$.hash, $$.use).size).reduce(=> $ + $$, 0)
      );
      
      [
        {
          $totalSizeA: $statA.compilation.entrypoints.($getSize({hash: $statA.compilation.hash, use: $useCompressedSize})).reduce(=> $ + $$, 0);
          $totalSizeB: $statB.compilation.entrypoints.($getSize({hash: $statB.compilation.hash, use: $useCompressedSize})).reduce(=> $ + $$, 0);
          $value: $totalSizeA - $totalSizeB;
          $valueP: $totalSizeA.percentFrom($totalSizeB);
          value: $value,
          valueP: $valueP,
          valueText: $value.formatSize(),
          valueTextP: $valueP.toFixed() + '%',
          label: "Total size",
          visible: $value
        },
        {
          $initialSizeA: $statA.compilation.entrypoints.($getInitialSize({hash: $statA.compilation.hash, use: $useCompressedSize})).reduce(=> $ + $$, 0);
          $initialSizeB: $statB.compilation.entrypoints.($getInitialSize({hash: $statB.compilation.hash, use: $useCompressedSize})).reduce(=> $ + $$, 0);
          $value: $initialSizeA - $initialSizeB;
          $valueP: $initialSizeA.percentFrom($initialSizeB);
          value: $value,
          valueP: $valueP,
          valueText: $value.formatSize(),
          valueTextP: $valueP.toFixed() + '%',
          label: 'Initial size',
          visible: $value
        },
        {
          $packagesSizeA: $statA.compilation.nodeModules.instances.modules.(getModuleSize($statA.compilation.hash, $useCompressedSize).size).reduce(=> $ + $$, 0);
          $packagesSizeB: $statB.compilation.nodeModules.instances.modules.(getModuleSize($statB.compilation.hash, $useCompressedSize).size).reduce(=> $ + $$, 0);
          $value: $packagesSizeA - $packagesSizeB;
          $valueP: $packagesSizeA.percentFrom($packagesSizeB);
          value: $value,
          valueP: $valueP,
          valueText: $value.formatSize(),
          valueTextP: $valueP.toFixed() + '%',
          label: 'Packages size',
          visible: $value
        },
        {
          $value: $statA.compilation.time - $statB.compilation.time;
          $valueP: $statA.compilation.time.percentFrom($statB.compilation.time);
          value: $value,
          valueP: $valueP,
          valueText: $value.formatDuration(),
          valueTextP: $valueP.toFixed() + '%',
          label: 'Build Time',
          visible: $value
        },
        {
          $a: $statA.compilation.entrypoints.size();
          $b: $statB.compilation.entrypoints.size();
          $value: $a - $b;
          $valueP: $a.percentFrom($b);
          value: $value,
          valueP: $valueP,
          valueText: $value,
          valueTextP: $valueP.toFixed() + '%',
          label: 'Entrypoints',
          visible: $value
        },
        {
          $a: ($statA.compilation..modules).size();
          $b: ($statB.compilation..modules).size();
          $value: $a - $b;
          $valueP: $a.percentFrom($b);
          value: $value,
          valueP: $valueP,
          valueText: $value,
          valueTextP: $valueP.toFixed() + '%',
          label: 'Modules',
          visible: $value
        },
        {
          $getDuplicateModules: => (
            $duplicates: (..modules).[source].group(<source>)
              .({source: key, duplicates: value})
              .[duplicates.size() > 1].(
                $module: duplicates[0];
                $dups: duplicates - [duplicates[0]];
                {
                  module: $module,
                  duplicates: $dups
                }
              );
            $duplicates.module.size()
          );
          $a: $statA.compilation.$getDuplicateModules();
          $b: $statB.compilation.$getDuplicateModules();
          $value: $a - $b;
          $valueP: $a.percentFrom($b);
          value: $value,
          valueP: $valueP,
          valueText: $value,
          valueTextP: $valueP.toFixed() + '%',
          label: 'Duplicate modules',
          visible: $value
        },
        {
          $a: ($statA.compilation.chunks + $statA.compilation.chunks..children).size();
          $b: ($statB.compilation.chunks + $statB.compilation.chunks..children).size();
          $value: $a - $b;
          $valueP: $a.percentFrom($b);
          value: $value,
          valueP: $valueP,
          valueText: $value,
          valueTextP: $valueP.toFixed() + '%',
          label: 'Chunks',
          visible: $value
        },
        {
          $a: $statA.compilation.assets.size();
          $b: $statB.compilation.assets.size();
          $value: $a - $b;
          $valueP: $a.percentFrom($b);
          value: $value,
          valueP: $valueP,
          valueText: $value,
          valueTextP: $valueP.toFixed() + '%',
          label: 'Assets',
          visible: $value
        },
        {
          $a: $statA.compilation.nodeModules.size();
          $b: $statB.compilation.nodeModules.size();
          $value: $a - $b;
          $valueP: $a.percentFrom($b);
          value: $value,
          valueP: $valueP,
          valueText: $value,
          valueTextP: $valueP.toFixed() + '%',
          label: 'Packages',
          visible: $value
        },
        {
          $packagesWithMultipleInstancesA: $statA.compilation.nodeModules.[instances.size() > 1];
          $packagesWithMultipleInstancesB: $statB.compilation.nodeModules.[instances.size() > 1];
          $a: $packagesWithMultipleInstancesA.instances.size() - $packagesWithMultipleInstancesA.size();
          $b: $packagesWithMultipleInstancesB.instances.size() - $packagesWithMultipleInstancesB.size();
          $value: $a - $b;
          $valueP: $a.percentFrom($b);
          value: $value,
          valueP: $valueP,
          valueText: $value,
          valueTextP: $valueP.toFixed() + '%',
          label: 'Package copies',
          visible: $value
        },
      ]
      `,
      content: [
        {
          when: `not .[visible]`,
          view: 'alert-success',
          data: '"The stats has no diff"',
        },
        {
          when: `.[visible]`,
          view: 'context',
          modifiers: {
            view: 'toggle-group',
            name: 'toggleShowValue',
            data: [
              {
                value: 'percent',
                text: '%',
              },
              {
                value: 'value',
                text: 'V',
              },
            ],
          },
          content: {
            view: 'block',
            className: styles['indicators-block'],
            content: {
              view: 'inline-list',
              item: {
                when: 'value',
                view: 'diff-indicator',
                data: `{label, value, valueText: #.toggleShowValue='value' ? valueText : valueTextP}`,
              },
            },
          },
        },
        {
          when: `.[visible]`,
          data: `
          $statA: #.params.hash.resolveStat();
          $statB: #.params.diffWith.resolveStat();
          $aModules: $statA.compilation..modules.[not shouldHideModule()];
          $bModules: $statB.compilation..modules.[not shouldHideModule()];
          
          $addedModules: $aModules.[not name.resolveModule(#.params.diffWith)];
          $removedModules: $bModules.[not name.resolveModule(#.params.hash)]; 
          $changedModules: $aModules.(
            $moduleA: $;
            $moduleB: $moduleA.name.resolveModule(#.params.diffWith);
            {
              a: $moduleA,
              b: $moduleB,
            }
          ).[b and (a.id != b.id or a.getModuleSize($statA.compilation.hash, $useCompressedSize).size != b.getModuleSize($statB.compilation.hash, $useCompressedSize).size or a.source != b.source)];
          
          $modulesDiff: {
            added: $addedModules.sort(getModuleSize($statA.compilation.hash, $useCompressedSize).size desc).({module: $, valueA: getModuleSize($statA.compilation.hash, $useCompressedSize).size, valueB: 0, hash: $statA.compilation.hash}),
            removed: $removedModules.sort(getModuleSize($statB.compilation.hash, $useCompressedSize).size desc).({module: $, valueA: 0, valueB: getModuleSize($statB.compilation.hash, $useCompressedSize).size, hash: $statB.compilation.hash}),
            changed: $changedModules.sort(a.getModuleSize($statA.compilation.hash, $useCompressedSize).size desc).({module: a, valueA: a.getModuleSize($statA.compilation.hash, $useCompressedSize).size, valueB: b.getModuleSize($statB.compilation.hash, $useCompressedSize).size, hash: $statA.compilation.hash}),
          };
          
          $getDuplicateModules: => (
            $compilation: $;
            (..modules).[
              source and not shouldHideModule() and name~=#.filter
            ].group(<source>)
            .({source: key, duplicates: value})
            .[duplicates.size() > 1].(
              $module: duplicates[0];
              $instance: $module.resolvedResource.nodeModule();
              $package: $instance.name.resolvePackage($compilation.hash);
              $dups: duplicates - [duplicates[0]];
              $dupModules: $dups;
              $dupPackages: $dups.(resolvedResource.nodeModule()).[].({
                $path: path;
                $resolvedPackage: name.resolvePackage($compilation.hash);
                package: $resolvedPackage,
                name: $resolvedPackage.name,
                instances: $resolvedPackage.instances.[path = $path]
              }).group(<name>).({name: key, instances: value.instances});
              {
                module: $module,
                hash: $compilation.hash,
                instance: $instance,
                isLocal: not $module.resolvedResource.nodeModule(),
                dupModules: $dupModules
              }
            )
            .sort(isLocal desc, instance.isRoot desc, dupModules.size() desc)
          );
          $dupModulesA: $statA.compilation.$getDuplicateModules();
          $dupModulesB: $statB.compilation.$getDuplicateModules();
          
          $dupModulesDiff: {
            added: $dupModulesA.[module.name not in $dupModulesB.module.name],
            removed: $dupModulesB.[module.name not in $dupModulesA.module.name],
          };
          
          $addedChunks: $statA.compilation.chunks.[id not in $statB.compilation.chunks.id]; 
          $removedChunks: $statB.compilation.chunks.[id not in $statA.compilation.chunks.id]; 
          $changedChunks: $statA.compilation.chunks.(
            $chunk: $;
            {
              a: $,
              b: $statB.compilation.chunks.[id=$chunk.id].pick()
            }
          ).[
            $aModules: a..modules.name;
            $bModules: b..modules.name;
            $changedModulesIds: $changedModules.a.name;
            b and (
              a.id != b.id or
              a.size != b.size or
              $aModules - 
              $bModules or 
              $bModules - 
              $aModules or
              $aModules.[$ in $changedModulesIds]
            )
          ];
          
          $chunksDiff: {
            added: $addedChunks.sort(initial desc, entry desc, size desc).({
              chunk: $,
              valueA: size,
              valueB: 0,
              hash: $statA.compilation.hash
            }),
            removed: $removedChunks.sort(initial desc, entry desc, size desc).({
              chunk: $,
              valueA: 0,
              valueB: size,
              hash: $statB.compilation.hash
            }),
            changed: $changedChunks.sort(a.initial desc, a.entry desc, a.size desc).({
              chunk: a,
              valueA: a.size,
              valueB: b.size,
              hash: $statA.compilation.hash
            })
          };
          
          $getInitialSize: => (
            $chunks: data.chunks.[initial];
            $assets: $chunks.files;
            $assets.(getAssetSize($$).size).reduce(=> $ + $$, 0)
          );
    
          $added: $statA.compilation.entrypoints.[name not in $statB.compilation.entrypoints.name].(
            $initialChunks: data.chunks.[initial];
            $initialAssets: $initialChunks.files;
            {
              name: name,
              data: data,
              size: $initialAssets.(getAssetSize($statA.compilation.hash, $useCompressedSize).size).reduce(=> $ + $$, 0)
            }
          );
          $removed: $statB.compilation.entrypoints.[name not in $statA.compilation.entrypoints.name].(
            $initialChunks: data.chunks.[initial];
            $initialAssets: $initialChunks.files;
            {
              name: name,
              data: data,
              size: $initialAssets.(getAssetSize($statB.compilation.hash, $useCompressedSize).size).reduce(=> $ + $$, 0)
            }
          );
          $changed: $statA.compilation.entrypoints.(
            $name: name;
            $a: $;
            $b: $statB.compilation.entrypoints.[name=$name].pick();
            {
              a: $a,
              b: $b
            } | {
              a: {...a, hash: $statA.compilation.hash, size: a.$getInitialSize({hash: $statA.compilation.hash, use: $useCompressedSize})},
              b: b and {...b, hash: $statB.compilation.hash, size: b.$getInitialSize$statB.compilation.hash()}
            }
          ).[
            $aChunksTop: a.chunks;
            $aChunks: $aChunksTop + $aChunksTop..children;
            $bChunksTop: b.chunks;
            $bChunks: $bChunksTop + $bChunksTop..children;
            $changedChunksIds: $changedChunks.a.id;
            b and (
              a.size != b.size or
              $aChunks - 
              $bChunks or 
              $bChunks - 
              $aChunks or
              $aChunks.[$ in $changedChunksIds]
            )
          ];
          
          $entryDiff: {
            changed: $changed.sort(a.data.isOverSizeLimit asc, a.size desc).({entry:a, hash: $statA.compilation.hash, valueA: a.size, valueB: b.size}),
            added: $added.sort(data.isOverSizeLimit asc, size desc).({entry:$, hash: $statA.compilation.hash, valueA: size, valueB: 0}),
            removed: $removed.sort(data.isOverSizeLimit asc, size desc).({entry:$, hash: $statB.compilation.hash, valueA: 0, valueB: size})
          };
          
          $addedAssets: $statA.compilation.assets.[name not in $statB.compilation.assets.name]; 
          $removedAssets: $statB.compilation.assets.[name not in $statA.compilation.assets.name];
          $changedAssets: $statA.compilation.assets.(
            $asset: $;
            {
              a: $,
              b: $statB.compilation.assets.[name=$asset.name].pick()
            }
          ).[b and a.getAssetSize($statA.compilation.hash, $useCompressedSize).size != b.getAssetSize($statB.compilation.hash, $useCompressedSize).size or chunks.[$ in $changedChunks.a.id]];
          
          $assetsDiff: {
            changed: $changedAssets.sort(a.isOverSizeLimit asc, a.getAssetSize($statA.compilation.hash, $useCompressedSize).size desc).({asset: a, valueA: a.getAssetSize($statA.compilation.hash, $useCompressedSize).size, valueB: b.getAssetSize($statB.compilation.hash, $useCompressedSize).size}),
            added: $addedAssets.sort(isOverSizeLimit asc, getAssetSize($statA.compilation.hash, $useCompressedSize).size desc).({asset: $, valueA: getAssetSize($statA.compilation.hash, $useCompressedSize).size, valueB: 0, hash: $statA.compilation.hash}),
            removed: $removedAssets.sort(isOverSizeLimit asc, getAssetSize($statB.compilation.hash, $useCompressedSize).size desc).({asset: $, valueA: 0, valueB: getAssetSize($statB.compilation.hash, $useCompressedSize).size, hash: $statB.compilation.hash})
          };
          
          $addedPackages: $statA.compilation.nodeModules.name - $statB.compilation.nodeModules.name;
          $removedPackages: $statB.compilation.nodeModules.name - $statA.compilation.nodeModules.name;
          $changedPackages: $statA.compilation.nodeModules.(
            $packageA: $;
            $packageB: $statB.compilation.nodeModules.[name=$packageA.name].pick();
            {
              a: $packageA,
              b: $packageB,
              instances: $packageB and {
                added: ($packageA.instances.path - $packageB.instances.path).(
                  $path: $;
                  {
                    package: $packageA,
                    instance: $packageA.instances.[path=$path].pick(),
                    hash: $statA.compilation.hash
                  }
                ).[instance],
                removed: ($packageB.instances.path - $packageA.instances.path).(
                  $path: $;
                  {
                    package: $packageB,
                    instance: $packageB.instances.[path=$path].pick(),
                    hash: $statB.compilation.hash
                  }
                ).[instance]
              }
            }
          ).[b and (instances.added or instances.removed)];
          
          $packagesDiff: {
            added: $addedPackages.(resolvePackage($statA.compilation.hash)).sort(instances.size() desc, name asc).({
              package: $,
              hash: $statA.compilation.hash,
              instances: {
                added: $.instances,
                removed: []
              }
            }),
            removed: $removedPackages.(resolvePackage($statB.compilation.hash)).sort(instances.size() desc, name asc).({
              package: $,
              hash: $statB.compilation.hash,
              instances: {
                added: [],
                removed: $.instances
              }
            }),
            changed: $changedPackages.sort(instances.added.size() desc, instances.removed.size() desc, name asc).({
              package: $,
              hash: $statA.compilation.hash,
              instances
            })
          };
          
          {
            entries: $entryDiff,
            assets: $assetsDiff,
            chunks: $chunksDiff,
            modules: $modulesDiff,
            moduleDups: $dupModulesDiff,
            packages: $packagesDiff
          }
          `,
          view: 'tabs',
          name: 'diffTabs',
          tabs: [
            {
              value: 'assets',
              when: 'assets.added or assets.changed or assets.removed',
              text: 'Assets',
            },
            {
              value: 'chunks',
              when: 'chunks.added or chunks.changed or chunks.removed',
              text: 'Chunks',
            },
            {
              value: 'modules',
              when: 'modules.added or modules.changed or modules.removed',
              text: 'Modules',
            },
            {
              value: 'modules-dups',
              when: 'modules-dups.added or modules-dups.changed or modules-dups.removed',
              text: 'Duplicate modules',
            },
            {
              value: 'entrypoints',
              when: 'entrypoints.added or entrypoints.changed or entrypoints.removed',
              text: 'Entrypoints',
            },
            {
              value: 'packages',
              when: 'packages.added or packages.changed or packages.removed',
              text: 'Packages',
            },
          ],
          content: {
            view: 'content-filter',
            content: {
              view: 'switch',
              content: [
                {
                  when: '#.diffTabs="entrypoints"',
                  content: entriesTab(),
                },
                {
                  when: '#.diffTabs="chunks"',
                  content: chunksTab(),
                },
                {
                  when: '#.diffTabs="assets"',
                  content: assetsTab(),
                },
                {
                  when: '#.diffTabs="modules"',
                  content: modulesTab(),
                },
                {
                  when: '#.diffTabs="modules-dups"',
                  content: modulesDupsTab(),
                },
                {
                  when: '#.diffTabs="packages"',
                  content: packagesTab(),
                },
              ],
            },
          },
        },
      ],
    },
  ]);
}
