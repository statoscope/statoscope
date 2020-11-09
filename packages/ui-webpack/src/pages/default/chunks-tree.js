import { moduleItemConfig } from './modules-tree';
import { assetItemConfig } from './assets-tree';
import { packageItemConfig } from './packages-tree';

export default (hash) => {
  return {
    view: 'tree',
    expanded: false,
    itemConfig: chunkItemConfig(void 0, hash),
  };
};

export function chunkItemConfig(getter = '$', hash = '#.params.hash') {
  return {
    content: {
      view: 'chunk-item',
      data: `{
        chunk: ${getter},
        hash: ${hash}, 
        match: #.filter
      }`,
    },
    children: `
    $reasonModules:origins.[moduleIdentifier].moduleIdentifier.(resolveModule(${hash})).[not shouldHideModule()];
    $chunkModules:(..modules).identifier.(resolveModule(${hash})).[not shouldHideModule()];
    $chunkModulesPackages:$chunkModules.(moduleResource().nodeModule()).[].(name.resolvePackage(${hash}));
    $chunkPackages:$chunkModulesPackages.({name: name, instances: instances.[modules.[$ in $chunkModules]]});
    $modules:modules.identifier.(resolveModule(${hash})).[not shouldHideModule()];
    [{
      title: "Reasons",
      reasons: $reasonModules,
      data: $reasonModules.chunks.(resolveChunk(${hash})).sort(initial desc, entry desc, size desc),
      visible: $reasonModules,
      type: 'reasons'
    }, {
      title: "Modules",
      // todo: wait contexts and filter modules by current chunk
      data: $modules.sort(moduleSize() desc),
      visible: $modules,
      type: 'modules'
    }, {
      title: "Packages",
      data: $chunkPackages.sort(instances.size() desc, name asc),
      visible: $chunkPackages,
      type: 'packages'
    }, {
      title: "Assets",
      data: files.(resolveAsset(${hash})).[$].sort(isOverSizeLimit asc, size desc),
      visible: files,
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
            get itemConfig() {
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
            $reasonChunks:reasons.chunks.(resolveChunk(${hash}));
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
            get itemConfig() {
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
                  postfix: data.reduce(=> $$ + $.size, 0).formatSize()
                }`,
              },
            ],
            children: 'data',
            limit: '= settingListItemsLimit()',
            get itemConfig() {
              return assetItemConfig(void 0, hash);
            },
          },
        },
      ],
    },
  };
}
