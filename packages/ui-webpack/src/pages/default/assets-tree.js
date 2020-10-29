import { moduleItemConfig } from './modules-tree';
import { chunkItemConfig } from './chunks-tree';
import { entryItemConfig } from './entry-tree';
import { packageItemConfig } from './packages-tree';

export default () => {
  return {
    view: 'tree',
    expanded: false,
    itemConfig: assetItemConfig(),
  };
};

export function assetItemConfig(getter = '$') {
  return {
    content: {
      view: 'asset-item',
      data: `{
        asset: ${getter}, 
        match: #.filter
      }`,
    },
    children: `
    $entrypoints:#.data.entrypoints.entries().(
      $chunks:value.chunks.(resolveChunk());
      {
        name: key,
        data: value, 
        chunks: $chunks + $chunks..(children.(resolveChunk()))
      }
    );
    $topLevelAssetChunks:chunks.(resolveChunk()).[files has @.name];
    $assetChunks: ($topLevelAssetChunks + $topLevelAssetChunks..(children.(resolveChunk()))).[files has @.name];
    $assetEntrypoints:$entrypoints.[chunks[id in $assetChunks.id]];
    $chunksModules:$assetChunks.(..modules).identifier.(resolveModule()).[not shouldHideModule()];
    $chunksModulesPackages:$chunksModules.(moduleResource().nodeModule().name.resolvePackage()).[$];
    $chunksPackages:$chunksModulesPackages.({name: name, instances: instances.[modules.[$ in $chunksModules]]});
    [{
      title: "Entrypoints",
      data: $entrypoints,
      visible: $assetEntrypoints,
      type: 'entrypoints'
    }, {
      title: "Chunks",
      data: $topLevelAssetChunks.sort(initial desc, entry desc, size desc),
      visible: $topLevelAssetChunks,
      type: 'chunks'
    }, {
      title: "Modules",
      data: $chunksModules.sort(moduleSize() desc),
      visible: $chunksModules,
      type: 'modules'
    }, {
      title: "Packages",
      data: $chunksPackages.sort(instances.size() desc, name asc),
      visible: $chunksPackages,
      type: 'packages'
    }].[visible]`,
    itemConfig: {
      view: 'switch',
      content: [
        {
          when: 'type="entrypoints"',
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
            get itemConfig() {
              return entryItemConfig();
            },
          },
        },
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
            children: 'data',
            limit: '= settingListItemsLimit()',
            get itemConfig() {
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
            get itemConfig() {
              return moduleItemConfig();
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
            get itemConfig() {
              return packageItemConfig();
            },
          },
        },
      ],
    },
  };
}
