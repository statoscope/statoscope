import { ModuleItemConfig, moduleItemConfig } from './modules-tree';

export type PackageTree = Record<string, unknown>;

export default (hash?: string): PackageTree => ({
  view: 'tree',
  expanded: false,
  limitLines: '= settingListItemsLimit()',
  itemConfig: packageItemConfig(hash),
});

export type PackageInstanceTree = Record<string, unknown>;

export function packageInstanceTree(hash?: string): PackageInstanceTree {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: packageInstanceItemConfig(hash),
  };
}

export type PackageItemConfig = Record<string, unknown>;

export function packageItemConfig(hash = '#.params.hash'): PackageItemConfig {
  return {
    limit: '= settingListItemsLimit()',
    children: 'instances.sort(isRoot desc, path asc).({instance: $, package: @.name})',
    content: `package-item:{package:$, hash: ${hash}, match: #.filter}`,
    get itemConfig(): PackageInstanceItemConfig {
      return packageInstanceItemConfig();
    },
  };
}

export type PackageInstanceItemConfig = Record<string, unknown>;

export function packageInstanceItemConfig(
  hash = '#.params.hash'
): PackageInstanceItemConfig {
  return {
    content: [
      {
        view: 'package-instance-item',
        data: `{
          instance,
          hash: ${hash},
          match: #.filter
        }`,
      },
    ],
    children: `[{
        title: "Reasons",
        data: instance.reasons,
        type: 'reasons'
      },{
        title: "Modules",
        data: instance.modules.[not shouldHideModule()].sort(getModuleSize(${hash}).size desc),
        type: 'modules'
      }]`,
    itemConfig: {
      view: 'switch',
      content: [
        {
          when: 'type="reasons"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `
              $reasonsWithModule:data.[type='module'].data.({reason: $, module: resolvedModule}).[module];
              [{
                title: "Chunks",
                reasons: $reasonsWithModule,
                children: $reasonsWithModule.module.[not shouldHideModule()].chunks.sort(initial desc, entry desc, size desc),
                type: 'chunk'
              }, {
                title: "Modules",
                children: $reasonsWithModule.module.[not shouldHideModule()].sort(getModuleSize(${hash}).size desc),
                type: 'module'
              }, {
                title: "Packages",
                reasons: $reasonsWithModule,
                children: $reasonsWithModule.module.(resolvedResource.nodeModule()).name.[],
                type: 'package'
              }].[children]`,
            itemConfig: {
              view: 'switch',
              content: [
                {
                  when: 'type="chunk"',
                  content: {
                    view: 'tree-leaf',
                    content: [
                      'text:title',
                      {
                        when: 'children',
                        view: 'badge',
                        className: 'hack-badge-margin-left',
                        data: `{text: children.size()}`,
                      },
                    ],
                    children: `children.({value: $, reasons: @.reasons})`,
                    itemConfig: {
                      content: `chunk-item:{chunk: value, hash: ${hash}}`,
                      children: `
                        $chunks:reasons.[module.chunks has @.value];
                        $chunks.module.({value: $, reasons: $chunks.reason}).sort(value.getModuleSize(${hash}).size desc)
                        `,
                      limit: '= settingListItemsLimit()',
                      get itemConfig(): ModuleItemConfig {
                        return moduleItemConfig('value', hash);
                      },
                    },
                  },
                },
                {
                  when: 'type="module"',
                  content: {
                    view: 'tree-leaf',
                    content: [
                      'text:title',
                      {
                        when: 'children',
                        view: 'badge',
                        className: 'hack-badge-margin-left',
                        data: `{text: children.size()}`,
                      },
                    ],
                    children: `children`,
                    limit: '= settingListItemsLimit()',
                    get itemConfig(): ModuleItemConfig {
                      return moduleItemConfig(void 0, hash);
                    },
                  },
                },
                {
                  when: 'type="package"',
                  content: {
                    view: 'tree-leaf',
                    content: [
                      'text:title',
                      {
                        when: 'children',
                        view: 'badge',
                        className: 'hack-badge-margin-left',
                        data: `{text: children.size()}`,
                      },
                    ],
                    children: `
                      children.(
                        $child:$;
                        {
                        value: $child,
                        reasons: @.reasons,
                        instances: resolvePackage(${hash}).instances.({value: $, reasons: @.reasons, package: $child})
                          .[
                            $foo:value.path;
                            reasons.reason.(moduleReasonResource().nodeModule()).path has $foo
                           ]
                      })
                      `,
                    itemConfig: {
                      content: [
                        {
                          view: 'package-item',
                          data: `{
                            package: value.resolvePackage(${hash}),
                            hash: ${hash},
                            match: #.filter
                          }`,
                        },
                      ],
                      children: `
                        instances.(
                          $instance: $;
                          {
                            $instance,
                            reasonModules: reasons.[not module.shouldHideModule() and reason.moduleReasonResource().nodeModule().path=$instance.value.path]
                              .group(<module>).({module:key,reasons:value.reason}).sort(module.getModuleSize(${hash}).size desc)
                          })`,
                      itemConfig: {
                        content: [
                          //'text-match:{text: instance.value.path, match: instance.package}',
                          {
                            view: 'package-instance-item',
                            data: `{
                              instance: instance.value,
                              hash: ${hash},
                              match: #.filter
                            }`,
                          },
                        ],
                        children: `reasonModules`,
                        limit: '= settingListItemsLimit()',
                        get itemConfig(): ModuleItemConfig {
                          return moduleItemConfig('module', hash);
                        },
                      },
                    },
                  },
                },
              ],
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
  };
}
