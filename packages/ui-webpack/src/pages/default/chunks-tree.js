import { moduleItemConfig } from './modules-tree';
import { assetItemConfig } from './assets-tree';
import { packageItemConfig } from './packages-tree';

export default (hash) => {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: chunkItemConfig(void 0, hash),
  };
};

export function chunkItemConfig(getter = '$', hash = '#.params.hash') {
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
      data: files.[].sort(isOverSizeLimit asc, size desc),
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
