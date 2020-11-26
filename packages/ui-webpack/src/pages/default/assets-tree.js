import { moduleItemConfig } from './modules-tree';
import { chunkItemConfig } from './chunks-tree';
import { entryItemConfig } from './entry-tree';
import { packageItemConfig } from './packages-tree';

export default (hash) => {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: assetItemConfig(void 0, hash),
  };
};

export function assetItemConfig(getter = '$', hash = '#.params.hash') {
  return {
    limit: '= settingListItemsLimit()',
    content: {
      view: 'asset-item',
      data: `{
        asset: ${getter}, 
        hash: ${hash},
        match: #.filter
      }`,
    },
    children: `
    $entrypoints:${hash}.resolveCompilation().entrypoints.({
      name,
      data, 
      chunks: chunks + chunks..children
    });
    $topLevelAssetChunks:chunks.[files has @];
    $assetChunks: $topLevelAssetChunks + $topLevelAssetChunks..children.[files has @];
    $assetEntrypoints:$entrypoints.[chunks[id in $assetChunks.id]];
    $chunksModules:$assetChunks.(..modules).[not shouldHideModule()];
    $chunksModulesPackages:$chunksModules.(resolvedResource.nodeModule()).[].(name.resolvePackage(${hash})).[];
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
              return entryItemConfig(void 0, hash);
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
              return chunkItemConfig(void 0, hash);
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
            get itemConfig() {
              return packageItemConfig(hash);
            },
          },
        },
      ],
    },
  };
}
