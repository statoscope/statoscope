import { ModuleItemConfig, moduleItemConfig } from './modules-tree';
import { AssetItemConfig, assetItemConfig } from './assets-tree';
import { PackageItemConfig, packageItemConfig } from './packages-tree';

export type ChunkTree = Record<string, unknown>;

export default (hash?: string): ChunkTree => {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: chunkItemConfig(void 0, hash),
  };
};

export type ChunkItemConfig = Record<string, unknown>;

export function chunkItemConfig(getter = '$', hash = '#.params.hash'): ChunkItemConfig {
  return {
    limit: '= settingListItemsLimit()',
    content: {
      view: 'chunk-item',
      data: `{
        chunk: ${getter},
        hash: ${hash}, 
        match: #.filter
      }`,
    },
    children: `
    $reasonModules:origins.resolvedModule.[].[not shouldHideModule()];
    $chunkModules:..modules.[not shouldHideModule()];
    $chunkModulesPackages:$chunkModules.(resolvedResource.nodeModule()).[].(name.resolvePackage(${hash}));
    $chunkPackages:$chunkModulesPackages.({name: name, instances: instances.[modules.[$ in $chunkModules]]});
    $modules:modules.[not shouldHideModule()];
    [{
      title: "Reasons",
      reasons: $reasonModules,
      data: $reasonModules.chunks.sort(initial desc, entry desc, size desc),
      visible: $reasonModules,
      type: 'reasons'
    }, {
      title: "Modules",
      // todo: wait contexts and filter modules by current chunk
      data: $modules,
      visible: $modules,
      type: 'modules'
    }, {
      title: "Packages",
      data: $chunkPackages.sort(instances.size() desc, name asc),
      visible: $chunkPackages,
      type: 'packages'
    }, {
      title: "Assets",
      data: files.[].sort(isOverSizeLimit asc, getAssetSize(${hash}).size desc),
      visible: files.[],
      type: 'assets'
    }].[visible]`,
    itemConfig: {
      view: 'switch',
      content: [
        {
          when: 'type="modules"',
          content: {
            view: 'tree-leaf',
            content: [
              'text:title',
              {
                when: 'data',
                view: 'badge',
                className: 'hack-badge-margin-left',
                data: `{text: data.size()}`,
              },
            ],
            children: 'data',
            limit: '= settingListItemsLimit()',
            get itemConfig(): ModuleItemConfig {
              return moduleItemConfig(void 0, hash);
            },
          },
        },
        {
          when: 'type="reasons"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `
            $reasonChunks:reasons.chunks;
            [{
              title: "Chunks",
              reasons: reasons,
              data: $reasonChunks,
              visible: $reasonChunks,
              type: 'chunks'
            }, {
              title: "Modules",
              data: reasons,
              visible: reasons,
              type: 'modules'
            }].[visible]`,
            itemConfig: {
              view: 'switch',
              content: [
                {
                  when: 'type="chunks"',
                  content: {
                    view: 'tree-leaf',
                    content: [
                      'text:title',
                      {
                        when: 'data',
                        view: 'badge',
                        className: 'hack-badge-margin-left',
                        data: `{text: data.size()}`,
                      },
                    ],
                    children: `data`,
                    limit: '= settingListItemsLimit()',
                    get itemConfig(): ChunkItemConfig {
                      return chunkItemConfig();
                    },
                  },
                },
                {
                  when: 'type="modules"',
                  content: {
                    view: 'tree-leaf',
                    content: [
                      'text:title',
                      {
                        when: 'data',
                        view: 'badge',
                        className: 'hack-badge-margin-left',
                        data: `{text: data.size()}`,
                      },
                    ],
                    children: 'data',
                    limit: '= settingListItemsLimit()',
                    get itemConfig(): ModuleItemConfig {
                      return moduleItemConfig(void 0, hash);
                    },
                  },
                },
              ],
            },
          },
        },
        {
          when: 'type="packages"',
          content: {
            view: 'tree-leaf',
            content: [
              'text:title',
              {
                when: 'data',
                view: 'badge',
                className: 'hack-badge-margin-left',
                data: `{text: data.size()}`,
              },
            ],
            children: 'data',
            limit: '= settingListItemsLimit()',
            get itemConfig(): PackageItemConfig {
              return packageItemConfig(hash);
            },
          },
        },
        {
          when: 'type="assets"',
          content: {
            view: 'tree-leaf',
            content: [
              'text:title',
              {
                when: 'data',
                view: 'badge',
                className: 'hack-badge-margin-left',
                data: `{
                  text: data.size(),
                  postfix: data.reduce(=> $$ + getAssetSize(${hash}).size, 0).formatSize()
                }`,
              },
            ],
            children: 'data',
            limit: '= settingListItemsLimit()',
            get itemConfig(): AssetItemConfig {
              return assetItemConfig(void 0, hash);
            },
          },
        },
      ],
    },
  };
}
