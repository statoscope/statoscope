import { StatoscopeWidget } from '../../types';
// @ts-ignore
import diffIndicatorStyle from '../views/diff-indicator.css';
// @ts-ignore
import style from '../views/helpers.css';
import packagesTree from './default/packages-tree';
import modulesTree, { moduleItemConfig } from './default/modules-tree';
import chunksTree from './default/chunks-tree';
import entryTree from './default/entry-tree';
import assetsTree from './default/assets-tree';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('default', [
    {
      data: '#.params.hash.resolveStat()',
      view: 'switch',
      content: [
        {
          when: 'not compilation',
          content: 'stats-list',
        },
        {
          when: 'compilation',
          content: [
            {
              view: 'page-header',
              prelude: [
                {
                  when: 'file.name',
                  view: 'badge',
                  data: `{ prefix: 'file name', text: file.name }`,
                },
                {
                  when: 'compilation.name',
                  view: 'badge',
                  data: `{ prefix: 'name', text: compilation.name.moduleNameResource() }`,
                },
                {
                  when: 'compilation.builtAt',
                  view: 'badge',
                  data: `{ prefix: 'date', text: compilation.builtAt.formatDate() }`,
                },
                {
                  when: 'compilation.hash',
                  view: 'badge',
                  data: `{prefix:'hash',text: compilation.hash}`,
                },
                {
                  when: 'file.version',
                  view: 'badge',
                  data: `{prefix:'version',text: file.version}`,
                },
              ],
              content: 'h1:#.name',
            },
            'stats-scheme-validation-error:file',
            {
              view: 'block',
              content: [
                {
                  when: `not (
                    compilation.modules or 
                    compilation.chunks or 
                    compilation.assets or 
                    compilation.entrypoints
                  )`,
                  view: 'alert-warning',
                  content: [
                    'h3: "No Data"',
                    `md: "Seems like this is an empty compilation"`,
                    `link: {text: "Choose another one", href: pageLink(#.page, {hash: ''})}`,
                  ],
                },
              ],
            },
            {
              when: `
                compilation.modules or 
                compilation.chunks or 
                compilation.assets or 
                compilation.entrypoints
              `,
              view: 'block',
              data: `
              $statA: $;
            
              $allChunks: $statA.compilation.entrypoints.data.chunks + $statA.compilation.entrypoints.data.chunks..children;
              $allAssetsSize: $allChunks.files.[].(getAssetSize($statA.compilation.hash)).reduce(=> size + $$, 0);

              $initialChunks: $allChunks.[initial];
              $initialAssetsSizes: $initialChunks.files.[].(getAssetSize($statA.compilation.hash));
              $initialAssetsSize: $initialAssetsSizes.reduce(=> size + $$, 0);

              $initialAssetsDownloadTime: $initialAssetsSizes
                .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
                .getDownloadTime();
              
              [
                {
                  value: $allAssetsSize.formatSize(),
                  label: "Total size",
                  visible: $statA.compilation.chunks.files
                },
                {
                  value: $initialAssetsSize.formatSize(),
                  label: 'Initial size',
                  visible: $statA.compilation.chunks.files
                },
                {
                  value: $initialAssetsDownloadTime.formatDuration(),
                  label: 'Initial download time',
                  visible: $initialAssetsDownloadTime
                },
                {
                  $packagesModulesA: $statA.compilation.nodeModules.instances.modules;
                  $packagesSizeA: $packagesModulesA.(getModuleSize($statA.compilation.hash)).reduce(=> size + $$, 0);
                  value: $packagesSizeA.formatSize(),
                  label: 'Packages size',
                  visible: $packagesModulesA
                },
                {
                  value: $statA.compilation.time.formatDuration(),
                  label: 'Build Time',
                  visible: $statA.compilation.time
                },
                {
                  value: $statA.compilation.entrypoints.size(),
                  label: 'Entrypoints',
                  visible: $statA.compilation.entrypoints
                },
                {
                  $modules: $statA.compilation..modules;
                  value: $modules.size(),
                  label: 'Modules',
                  visible: $modules
                },
                {
                  $duplicates: $statA.compilation.(..modules).[source].group(<source>)
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
                  label: 'Duplicate modules',
                  visible: $duplicates
                },
                {
                  value: ($statA.compilation.chunks + $statA.compilation.chunks..children).size(),
                  label: 'Chunks',
                  visible: $statA.compilation.chunks
                },
                {
                  value: $statA.compilation.assets.size(),
                  label: 'Assets',
                  visible: $statA.compilation.assets
                },
                {
                  value: $statA.compilation.nodeModules.size(),
                  label: 'Packages',
                  visible: $statA.compilation.nodeModules
                },
                {
                  $value: (
                    $packagesWithMultipleInstancesA: $statA.compilation.nodeModules.[instances.size() > 1];
                    $copiesA: $packagesWithMultipleInstancesA.instances.size() - $packagesWithMultipleInstancesA.size();
                    $copiesA
                  );
                  value: $value,
                  label: 'Package copies',
                  visible: $value
                },
                {
                  $childCompilations: $statA.compilation.children.[not shouldHideCompilation()];
                  value: $childCompilations.size(),
                  label: "Child compilations",
                  visible: $childCompilations
                },
                {
                  $compilationItems: $statA.compilation.hash.validation_getItems();
                  value: $compilationItems.size(),
                  label: "Validation messages",
                  visible: $compilationItems,
                  href: pageLink("stats-validation", { hash: $statA.compilation.hash })
                },
              ]
              `,
              content: {
                view: 'inline-list',
                item: {
                  when: 'visible',
                  view: 'indicator',
                  className: diffIndicatorStyle.root,
                },
              },
            },
            {
              view: 'block',
              content: [
                {
                  when: `
                    compilation.modules or 
                    compilation.chunks or 
                    compilation.assets or 
                    compilation.entrypoints
                  `,
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
                            $hash: compilation.hash;
                            compilation.modules.[not shouldHideModule()].[
                              name~=#.filter or modules and modules.[name~=#.filter]
                            ]
                            .sort(getModuleSize($hash).size desc)
                            `,
                            content: {
                              ...modulesTree(),
                            },
                          },
                          {
                            when: '#.instantLists="modules-dups"',
                            data: `
                            $hash: compilation.hash;
                            compilation
                              .(..modules).[
                                source and not shouldHideModule() and name~=#.filter
                              ]
                              .group(<source>)
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
                                className: style.root,
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
                            compilation.chunks.sort(initial desc, entry desc, size desc).[
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
                            $hash: compilation.hash;
                            compilation.assets.[name~=#.filter]
                            .sort(isOverSizeLimit asc, getAssetSize($hash).size desc)
                            `,
                            content: {
                              ...assetsTree(),
                            },
                          },
                          {
                            when: '#.instantLists="entrypoints"',
                            data: `
                            $hash: compilation.hash;
                            compilation.entrypoints
                              .[name~=#.filter]
                              .sort(data.isOverSizeLimit asc)
                            `,
                            content: {
                              ...entryTree(),
                            },
                          },
                          {
                            when: '#.instantLists="packages"',
                            data: `
                            compilation.nodeModules
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
