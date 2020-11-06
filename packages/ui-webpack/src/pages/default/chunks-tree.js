import { moduleItemConfig } from './modules-tree';
import { assetItemConfig } from './assets-tree';
import { packageItemConfig } from './packages-tree';

export default () => {
  return {
    view: 'tree',
    expanded: false,
    itemConfig: chunkItemConfig(),
  };
};

export function chunkItemConfig(getter = '$') {
  return {
    content: {
      view: 'chunk-item',
      data: `{
        chunk: ${getter}, 
        match: #.filter
      }`,
    },
    children: `
    $reasonModules:origins.[moduleIdentifier].moduleIdentifier.(resolveModule(#.params.hash)).[not shouldHideModule()];
    $chunkModules:(..modules).identifier.(resolveModule(#.params.hash)).[not shouldHideModule()];
    $chunkModulesPackages:$chunkModules.(moduleResource().nodeModule()).[].(name.resolvePackage(#.params.hash));
    $chunkPackages:$chunkModulesPackages.({name: name, instances: instances.[modules.[$ in $chunkModules]]});
    $modules:modules.identifier.(resolveModule(#.params.hash)).[not shouldHideModule()];
    [{
      title: "Reasons",
      reasons: $reasonModules,
      data: $reasonModules.chunks.(resolveChunk(#.params.hash)).sort(initial desc, entry desc, size desc),
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
      data: files.(resolveAsset(#.params.hash)).[$].sort(isOverSizeLimit asc, size desc),
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
              return moduleItemConfig();
            },
          },
        },
        {
          when: 'type="reasons"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `
            $reasonChunks:reasons.chunks.(resolveChunk(#.params.hash));
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
                      return moduleItemConfig();
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
              return packageItemConfig();
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
              return assetItemConfig();
            },
          },
        },
      ],
    },
  };
}
