import styles from './diff.css';

function statsSelect(value, onChange) {
  return {
    view: 'select',
    placeholder: 'choose a stat',
    value: value,
    text: 'resolveStats().statName()',
    data: 'values().hash',
    onChange,
  };
}

function sizeDiff() {
  return {
    view: 'badge',
    className: 'hack-badge-margin-left',
    data: `
    $diff: sizeA - sizeB;
    $diffPerc: sizeA.percentFrom(sizeB).toFixed();
    $inc: $diff > 0;
    $prefix: $inc ? '+' : '';
    {
      text: $prefix + $diff.formatSize(),
      postfix: $prefix + $diffPerc + '%',
      color: $inc ? 0.colorFromH() : undefined,
      hint: sizeA.formatSize()
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
        view: 'switch',
        content: [
          {
            when: 'true',
            content: {
              view: 'tree-leaf',
              expanded: true,
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
        ],
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
        view: 'switch',
        content: [
          {
            when: 'true',
            content: {
              view: 'tree-leaf',
              expanded: true,
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
        ],
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
        view: 'switch',
        content: [
          {
            when: 'true',
            content: {
              view: 'tree-leaf',
              expanded: true,
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
        ],
      },
    },
  ];
}

function modulesTab() {
  return [
    {
      view: 'tree',
      data: `
      $changed: modules.changed.[module.moduleResource()~=#.filter];
      $added: modules.added.[module.moduleResource()~=#.filter];
      $removed: modules.removed.[module.moduleResource()~=#.filter];
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
        view: 'switch',
        content: [
          {
            when: 'true',
            content: {
              view: 'tree-leaf',
              expanded: true,
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
        ],
      },
    },
  ];
}

function packagesTab() {
  return [
    {
      view: 'tree',
      data: `
      $changed: packages.changed.[(package.a or package).name~=#.filter];
      $added: packages.added.[(package.a or package).name~=#.filter];
      $removed: packages.removed.[(package.a or package).name~=#.filter];
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
      data: `
      $statA: #.params.hash.resolveStats();
      $statB: #.params.diffWith.resolveStats();
      $aModules: $statA..modules.[not shouldHideModule()];
      $bModules: $statB..modules.[not shouldHideModule()];
      
      $addedModules: $aModules.identifier - $bModules.identifier;
      $removedModules: $bModules.identifier - $aModules.identifier; 
      $changedModules: $aModules.(
        $moduleA: $;
        $moduleB: $bModules.[identifier=$moduleA.identifier].pick();
        {
          a: $moduleA,
          b: $moduleB,
        }
      ).[b and (a.size != b.size or a.source != b.source)];
      
      $modulesDiff: {
        added: $addedModules.(resolveModule($statA.hash)).({module: $, sizeA: size, sizeB: 0, hash: $statA.hash}),
        removed: $removedModules.(resolveModule($statB.hash)).({module: $, sizeA: 0, sizeB: size, hash: $statB.hash}),
        changed: $changedModules.({module: a, sizeA: a.size, sizeB: b.size, hash: $statA.hash}),
      };
      
      $addedChunks: $statA.chunks.id - $statB.chunks.id; 
      $removedChunks: $statB.chunks.id - $statA.chunks.id; 
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
        added: $addedChunks.(resolveChunk($statA.hash)).sort(<initial>).({
          chunk: $,
          sizeA: size,
          sizeB: 0,
          hash: $statA.hash
        }),
        removed: $removedChunks.(resolveChunk($statB.hash)).sort(<initial>).({
          chunk: $,
          sizeA: 0,
          sizeB: size,
          hash: $statB.hash
        }),
        changed: $changedChunks.sort(<a.initial>).({
          chunk: a,
          sizeA: a.size,
          sizeB: b.size,
          hash: $statA.hash
        })
      };
      
      $getInitialSize: => (
        $initialChunks: $.data.chunks.(resolveChunk($$));
        $initialAssets: $initialChunks.files.(resolveAsset($$)).[];
        $initialAssets.size.reduce(=> $ + $$, 0)
      );

      $added: ($statA.entrypoints.keys() - $statB.entrypoints.keys()).(
        $initialChunks: $statA.entrypoints[$].chunks.(resolveChunk($statA.hash));
        $initialAssets: $initialChunks.files.(resolveAsset($statA.hash)).[];
        {
          name: $,
          data: $statA.entrypoints[$],
          size: $initialAssets.size.reduce(=> $ + $$, 0)
        }
      );
      $removed: ($statB.entrypoints.keys() - $statA.entrypoints.keys()).(
        $initialChunks: $statB.entrypoints[$].chunks.(resolveChunk($statA.hash));
        $initialAssets: $initialChunks.files.(resolveAsset($statA.hash)).[];
        {
          name: $,
          data: $statB.entrypoints[$],
          size: $initialAssets.size.reduce(=> $ + $$, 0)
        }
      );
      $changed: $statA.entrypoints.keys().(
        $name: $;
        $a: $statA.entrypoints[$];
        $b: $statB.entrypoints[$];
        {
          a: {name: $name, data: $a},
          b: $b and {name: $name, data: $b}
        } | {
          a: {...a, hash: $statA.hash, size: a.$getInitialSize($statA.hash)},
          b: b and {...b, hash: $statB.hash, size: b.$getInitialSize($statB.hash)}
        }
      ).[
        $aChunksTop: a.chunks.(resolveChunk($statA.hash));
        $aChunks: $aChunksTop + $aChunksTop..(children.(resolveChunk($statA.hash)));
        $bChunksTop: b.chunks.(resolveChunk($statB.hash));
        $bChunks: $bChunksTop + $bChunksTop..(children.(resolveChunk($statB.hash)));
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
        changed: $changed.({entry:a, hash: $statA.hash, sizeA: a.size, sizeB: b.size}),
        added: $added.({entry:$, hash: $statA.hash, sizeA: size, sizeB: 0}),
        removed: $removed.({entry:$, hash: $statB.hash, sizeA: 0, sizeB: size})
      };
      
      $addedAssets: $statA.assets.name - $statB.assets.name; 
      $removedAssets: $statB.assets.name - $statA.assets.name; 
      $changedAssets: $statA.assets.(
        $asset: $;
        {
          a: $,
          b: $statB.assets.[name=$asset.name].pick()
        }
      ).[b and a.size != b.size or chunks.[$ in $changedChunks.a.id]];
      
      $assetsDiff: {
        changed: $changedAssets.({asset: a, sizeA: a.size, sizeB: b.size}),
        added: $addedAssets.(resolveAsset($statA.hash)).({asset: $, sizeA: size, sizeB: 0, hash: $statA.hash}),
        removed: $removedAssets.(resolveAsset($statB.hash)).({asset: $, sizeA: 0, sizeB: size, hash: $statB.hash})
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
        added: $addedPackages.(resolvePackage($statA.hash)).({
          package: $,
          hash: $statA.hash,
          instances: {
            added: $.instances,
            removed: []
          }
        }),
        removed: $removedPackages.(resolvePackage($statB.hash)).({
          package: $,
          hash: $statB.hash,
          instances: {
            added: [],
            removed: $.instances
          }
        }),
        changed: $changedPackages.({
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
        packages: $packagesDiff
      }
      `,
      view: 'tabs',
      name: 'diffTabs',
      tabs: [
        { value: 'assets', text: 'Assets' },
        { value: 'chunks', text: 'Chunks' },
        { value: 'modules', text: 'Modules' },
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
              when: '#.diffTabs="packages"',
              content: packagesTab(),
            },
          ],
        },
      },
    },
  ]);
}
