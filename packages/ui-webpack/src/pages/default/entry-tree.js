import { assetItemConfig } from './assets-tree';
import { chunkItemConfig } from './chunks-tree';
import { moduleItemConfig } from './modules-tree';
import { packageItemConfig } from './packages-tree';

export default (hash) => {
  return {
    view: 'tree',
    expanded: false,
    itemConfig: entryItemConfig(void 0, hash),
  };
};

export function entryItemConfig(getter = '$', hash = '#.params.hash') {
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
    $topLevelChunks:$entry.data.chunks.(resolveChunk(${hash}));
    $chunks:($topLevelChunks + $topLevelChunks..(children.(resolveChunk(${hash}))));
    $chunksModules:$chunks.(..modules).identifier.(resolveModule(${hash})).[not shouldHideModule()];
    $chunksModulesPackages:$chunksModules.(moduleResource().nodeModule()).[].(name.resolvePackage(${hash})).[$];
    $chunksPackages:$chunksModulesPackages.({name: name, instances: instances.[modules.[$ in $chunksModules]]});
    [{
      title: "Chunks",
      data: $chunks.sort(initial desc, entry desc, size desc),
      visible: true,
      type: 'chunks'
    },{
      title: "Modules",
      data: $chunks.modules.identifier.(resolveModule(${hash})).[not shouldHideModule()].sort(moduleSize() desc),
      visible: true,
      type: 'modules'
    },{
      title: "Packages",
      data: $chunksPackages.sort(instances.size() desc, name asc),
      visible: $chunksPackages,
      type: 'packages'
    },{
      title: "Assets",
      visible: true,
      chunks: $chunks,
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
              get itemConfig() {
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
        {
          when: 'type="assets"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `
            $initialChunks:chunks.[initial];
            $asyncChunks:chunks.[not initial];
            $initialAssets:$initialChunks.files.(resolveAsset(${hash})).[$];
            $asyncAssets:$asyncChunks.files.(resolveAsset(${hash})).[$];
            [{
              title: "Initial",
              data: $initialAssets.sort(isOverSizeLimit asc, size desc),
              visible: $initialAssets,
              type: 'initial'
            },
            {
              title: "Async",
              data: $asyncAssets.sort(isOverSizeLimit asc, size desc),
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
              get itemConfig() {
                return assetItemConfig(void 0, hash);
              },
            },
          },
        },
      ],
    },
  };
}
