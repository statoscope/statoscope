import { AssetItemConfig, assetItemConfig } from './assets-tree';
import { ChunkItemConfig, chunkItemConfig } from './chunks-tree';
import { ModuleItemConfig, moduleItemConfig } from './modules-tree';
import { PackageItemConfig, packageItemConfig } from './packages-tree';

export type EntryTree = Record<string, unknown>;

export default (hash?: string): EntryTree => {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: entryItemConfig(void 0, hash),
  };
};

export type EntryItemConfig = Record<string, unknown>;

export function entryItemConfig(getter = '$', hash = '#.params.hash'): EntryItemConfig {
  return {
    limit: '= settingListItemsLimit()',
    content: {
      view: 'entry-item',
      data: `{
        entrypoint: ${getter},
        hash: ${hash},
        match: #.filter
      }`,
    },
    children: `
    $entry:$;
    $topLevelChunks:$entry.data.chunks;
    $chunks:$topLevelChunks + $topLevelChunks..children;
    $chunksAllModules:$chunks..modules.[not shouldHideModule()];
    $chunksModules:$chunks.modules.[not shouldHideModule()];
    $chunksModulesPackages:$chunksAllModules.(resolvedResource.nodeModule()).(name and name.resolvePackage(${hash})).[];
    $chunksPackages:$chunksModulesPackages.({name: name, instances: instances.[modules.[$ in $chunksAllModules]]});
    [{
      title: "Chunks",
      data: $chunks.sort(initial desc, entry desc, size desc),
      visible: $chunks,
      type: 'chunks'
    },{
      title: "Modules",
      data: $chunksModules,
      visible: $chunksModules,
      type: 'modules'
    },{
      title: "Packages",
      data: $chunksPackages.sort(instances.size() desc, name asc),
      visible: $chunksPackages,
      type: 'packages'
    },{
      title: "Assets",
      chunks: $chunks,
      visible: $chunks,
      type: 'assets'
    }].[visible]`,
    itemConfig: {
      view: 'switch',
      content: [
        {
          when: 'type="chunks"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `
            $initialChunks:data.[initial];
            $asyncChunks:data.[not initial];
            [{
              title: "Initial",
              data: $initialChunks,
              visible: $initialChunks,
              type: 'initial'
            },
            {
              title: "Async",
              data: $asyncChunks,
              visible: $asyncChunks,
              type: 'async'
            }].[visible]`,
            itemConfig: {
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
                return chunkItemConfig(void 0, hash);
              },
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
            children: `data`,
            limit: '= settingListItemsLimit()',
            get itemConfig(): ModuleItemConfig {
              return moduleItemConfig(void 0, hash);
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
            content: 'text:title',
            children: `
            $initialChunks:chunks.[initial];
            $asyncChunks:chunks.[not initial];
            $initialAssets:$initialChunks.files;
            $asyncAssets:$asyncChunks.files;
            [{
              title: "Initial",
              data: $initialAssets.sort(isOverSizeLimit asc, getAssetSize(${hash}).size desc),
              visible: $initialAssets,
              type: 'initial'
            },
            {
              title: "Async",
              data: $asyncAssets.sort(isOverSizeLimit asc, getAssetSize(${hash}).size desc),
              visible: $asyncAssets,
              type: 'async'
            }].[visible]`,
            itemConfig: {
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
              get itemConfig(): AssetItemConfig {
                return assetItemConfig(void 0, hash);
              },
            },
          },
        },
      ],
    },
  };
}
