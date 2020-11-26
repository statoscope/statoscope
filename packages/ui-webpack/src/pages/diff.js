import styles from './diff.css';

function statsSelect(value, onChange) {
  return {
    view: 'select',
    placeholder: 'choose a stat',
    value: value,
    text: `
    $compilation: resolveCompilation();
    $compilation.compilationName() + ' ' + $compilation.builtAt.formatDate()
    `,
    data: 'values().hash',
    onChange,
  };
}

function sizeDiff() {
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

function entriesTab() {
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

function chunksTab() {
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

function assetsTab() {
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

function modulesTab() {
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

function modulesDupsTab() {
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

function packagesTab() {
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

export default function (discovery) {
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
                statsSelect('#.params.hash', (value) => {
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
              onClick() {
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
        data: `
        $statA: #.params.hash.resolveCompilation();
        $statB: #.params.diffWith.resolveCompilation();
        
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
            $totalSizeB: $statB.entrypoints.($getSize()).reduce(=> $ + $$, 0);
            $value: $totalSizeA - $totalSizeB;
            $valueP: $totalSizeA.percentFrom($totalSizeB);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText:  #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value.formatSize(),
            label: "Total size"
          },
          {
            $initialSizeA: $statA.entrypoints.($getInitialSize()).reduce(=> $ + $$, 0);
            $initialSizeB: $statB.entrypoints.($getInitialSize()).reduce(=> $ + $$, 0);
            $value: $initialSizeA - $initialSizeB;
            $valueP: $initialSizeA.percentFrom($initialSizeB);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value.formatSize(),
            label: 'Initial size'
          },
          {
            $packagesSizeA: $statA.nodeModules.instances.modules.size.reduce(=> $ + $$, 0);
            $packagesSizeB: $statB.nodeModules.instances.modules.size.reduce(=> $ + $$, 0);
            $value: $packagesSizeA - $packagesSizeB;
            $valueP: $packagesSizeA.percentFrom($packagesSizeB);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value.formatSize(),
            label: 'Packages size'
          },
          {
            $value: $statA.time - $statB.time;
            $valueP: $statA.time.percentFrom($statB.time);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value.formatDuration(),
            label: 'Build Time'
          },
          {
            $a: $statA.entrypoints.size();
            $b: $statB.entrypoints.size();
            $value: $a - $b;
            $valueP: $a.percentFrom($b);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value,
            label: 'Entrypoints'
          },
          {
            $a: ($statA..modules).size();
            $b: ($statB..modules).size();
            $value: $a - $b;
            $valueP: $a.percentFrom($b);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value,
            label: 'Modules'
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
            $a: $statA.$getDuplicateModules();
            $b: $statB.$getDuplicateModules();
            $value: $a - $b;
            $valueP: $a.percentFrom($b);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value,
            label: 'Duplicate modules'
          },
          {
            $a: ($statA.chunks + $statA.chunks..children).size();
            $b: ($statB.chunks + $statB.chunks..children).size();
            $value: $a - $b;
            $valueP: $a.percentFrom($b);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value,
            label: 'Chunks'
          },
          {
            $a: $statA.assets.size();
            $b: $statB.assets.size();
            $value: $a - $b;
            $valueP: $a.percentFrom($b);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value,
            label: 'Assets'
          },
          {
            $a: $statA.nodeModules.size();
            $b: $statB.nodeModules.size();
            $value: $a - $b;
            $valueP: $a.percentFrom($b);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value,
            label: 'Packages'
          },
          {
            $packagesWithMultipleInstancesA: $statA.nodeModules.[instances.size() > 1];
            $packagesWithMultipleInstancesB: $statB.nodeModules.[instances.size() > 1];
            $a: $packagesWithMultipleInstancesA.instances.size() - $packagesWithMultipleInstancesA.size();
            $b: $packagesWithMultipleInstancesB.instances.size() - $packagesWithMultipleInstancesB.size();
            $value: $a - $b;
            $valueP: $a.percentFrom($b);
            value: #.toggleShowValue='percent' ? $valueP : $value,
            valueText: #.toggleShowValue='percent' ? $valueP.toFixed() + '%' : $value,
            label: 'Package copies'
          },
        ]
        `,
        content: {
          view: 'inline-list',
          item: {
            when: 'value',
            view: 'diff-indicator',
          },
        },
      },
    },
    {
      data: `
      $statA: #.params.hash.resolveCompilation();
      $statB: #.params.diffWith.resolveCompilation();
      $aModules: $statA..modules.[not shouldHideModule()];
      $bModules: $statB..modules.[not shouldHideModule()];
      
      $addedModules: $aModules.[identifier not in $bModules.identifier];
      $removedModules: $bModules.[identifier not in $aModules.identifier]; 
      $changedModules: $aModules.(
        $moduleA: $;
        $moduleB: $bModules.[identifier=$moduleA.identifier].pick();
        {
          a: $moduleA,
          b: $moduleB,
        }
      ).[b and (a.size != b.size or a.source != b.source)];
      
      $modulesDiff: {
        added: $addedModules.sort(moduleSize() desc).({module: $, valueA: size, valueB: 0, hash: $statA.hash}),
        removed: $removedModules.sort(moduleSize() desc).({module: $, valueA: 0, valueB: size, hash: $statB.hash}),
        changed: $changedModules.sort(a.moduleSize() desc).({module: a, valueA: a.size, valueB: b.size, hash: $statA.hash}),
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
      $dupModulesA: $statA.$getDuplicateModules();
      $dupModulesB: $statB.$getDuplicateModules();
      
      $dupModulesDiff: {
        added: $dupModulesA.[module.identifier not in $dupModulesB.module.identifier],
        removed: $dupModulesB.[module.identifier not in $dupModulesA.module.identifier],
      };
      
      $addedChunks: $statA.chunks.[id not in $statB.chunks.id]; 
      $removedChunks: $statB.chunks.[id not in $statA.chunks.id]; 
      $changedChunks: $statA.chunks.(
        $chunk: $;
        {
          a: $,
          b: $statB.chunks.[id=$chunk.id].pick()
        }
      ).[
        $aModules: a..modules.identifier;
        $bModules: b..modules.identifier;
        $changedModulesIds: $changedModules.a.identifier;
        b and (
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
          hash: $statA.hash
        }),
        removed: $removedChunks.sort(initial desc, entry desc, size desc).({
          chunk: $,
          valueA: 0,
          valueB: size,
          hash: $statB.hash
        }),
        changed: $changedChunks.sort(a.initial desc, a.entry desc, a.size desc).({
          chunk: a,
          valueA: a.size,
          valueB: b.size,
          hash: $statA.hash
        })
      };
      
      $getInitialSize: => (
        $chunks: data.chunks.[initial];
        $assets: $chunks.files;
        $assets.size.reduce(=> $ + $$, 0)
      );

      $added: $statA.entrypoints.[name not in $statB.entrypoints.name].(
        $initialChunks: data.chunks.[initial];
        $initialAssets: $initialChunks.files;
        {
          name: name,
          data: data,
          size: $initialAssets.size.reduce(=> $ + $$, 0)
        }
      );
      $removed: $statB.entrypoints.[name not in $statA.entrypoints.name].(
        $initialChunks: data.chunks.[initial];
        $initialAssets: $initialChunks.files;
        {
          name: name,
          data: data,
          size: $initialAssets.size.reduce(=> $ + $$, 0)
        }
      );
      $changed: $statA.entrypoints.(
        $name: name;
        $a: $;
        $b: $statB.entrypoints.[name=$name].pick();
        {
          a: $a,
          b: $b
        } | {
          a: {...a, hash: $statA.hash, size: a.$getInitialSize()},
          b: b and {...b, hash: $statB.hash, size: b.$getInitialSize()}
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
        changed: $changed.sort(a.data.isOverSizeLimit asc, a.size desc).({entry:a, hash: $statA.hash, valueA: a.size, valueB: b.size}),
        added: $added.sort(data.isOverSizeLimit asc, size desc).({entry:$, hash: $statA.hash, valueA: size, valueB: 0}),
        removed: $removed.sort(data.isOverSizeLimit asc, size desc).({entry:$, hash: $statB.hash, valueA: 0, valueB: size})
      };
      
      $addedAssets: $statA.assets.[name not in $statB.assets.name]; 
      $removedAssets: $statB.assets.[name not in $statA.assets.name];
      $changedAssets: $statA.assets.(
        $asset: $;
        {
          a: $,
          b: $statB.assets.[name=$asset.name].pick()
        }
      ).[b and a.size != b.size or chunks.[$ in $changedChunks.a.id]];
      
      $assetsDiff: {
        changed: $changedAssets.sort(a.isOverSizeLimit asc, a.size desc).({asset: a, valueA: a.size, valueB: b.size}),
        added: $addedAssets.sort(isOverSizeLimit asc, size desc).({asset: $, valueA: size, valueB: 0, hash: $statA.hash}),
        removed: $removedAssets.sort(isOverSizeLimit asc, size desc).({asset: $, valueA: 0, valueB: size, hash: $statB.hash})
      };
      
      $addedPackages: $statA.nodeModules.name - $statB.nodeModules.name;
      $removedPackages: $statB.nodeModules.name - $statA.nodeModules.name;
      $changedPackages: $statA.nodeModules.(
        $packageA: $;
        $packageB: $statB.nodeModules.[name=$packageA.name].pick();
        {
          a: $packageA,
          b: $packageB,
          instances: $packageB and {
            added: ($packageA.instances.path - $packageB.instances.path).(
              $path: $;
              {
                package: $packageA,
                instance: $packageA.instances.[path=$path].pick(),
                hash: $statA.hash
              }
            ).[instance],
            removed: ($packageB.instances.path - $packageA.instances.path).(
              $path: $;
              {
                package: $packageB,
                instance: $packageB.instances.[path=$path].pick(),
                hash: $statB.hash
              }
            ).[instance]
          }
        }
      ).[b and (instances.added or instances.removed)];
      
      $packagesDiff: {
        added: $addedPackages.(resolvePackage($statA.hash)).sort(instances.size() desc, name asc).({
          package: $,
          hash: $statA.hash,
          instances: {
            added: $.instances,
            removed: []
          }
        }),
        removed: $removedPackages.(resolvePackage($statB.hash)).sort(instances.size() desc, name asc).({
          package: $,
          hash: $statB.hash,
          instances: {
            added: [],
            removed: $.instances
          }
        }),
        changed: $changedPackages.sort(instances.added.size() desc, instances.removed.size() desc, name asc).({
          package: $,
          hash: $statA.hash,
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
        { value: 'assets', text: 'Assets' },
        { value: 'chunks', text: 'Chunks' },
        { value: 'modules', text: 'Modules' },
        { value: 'modules-dups', text: 'Duplicate modules' },
        { value: 'entrypoints', text: 'Entrypoints' },
        { value: 'packages', text: 'Packages' },
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
  ]);
}
