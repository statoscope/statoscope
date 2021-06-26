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
        view: 'link',
        data: `{
          text: instance.path,
          href: (package.name or package).pageLink("package", {instance: instance.path, hash:${hash}}),
          match: (package.name or package)
        }`,
        content: 'text-match',
      },
      {
        view: 'badge',
        className: 'hack-badge-margin-left',
        when: `(package.name or package).getInstanceInfo(instance.path, ${hash})`,
        data: `{
          text: (package.name or package).getInstanceInfo(instance.path, ${hash}).info.version
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
              $reasonsWithModule:data.[type='module'].data.({reason: $, module: resolvedModule});
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
                        `link:{
                          text: value,
                          href: value.pageLink("package", {hash:${hash}}),
                        }`,
                        {
                          when: 'reasons',
                          view: 'badge',
                          className: 'hack-badge-margin-left',
                          data: `{text: instances.size(), postfix: instances.size().plural(['instance', 'instances'])}`,
                        },
                        {
                          when: `
                          $package: value;
                          not compact and instances.($package.getInstanceInfo(value.path, ${hash})).info.version.size() > 1
                          `,
                          view: 'badge',
                          data: `
                          $package: value;
                          $size: instances.($package.getInstanceInfo(value.path, ${hash})).info.version.size();
                          {
                            text: $size,
                            postfix: $size.plural(['version', 'versions'])
                          }
                          `,
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
                            view: 'link',
                            data: `{text: instance.value.path, href: "#package:" + instance.package.encodeURIComponent()+"&instance="+instance.value.path.encodeURIComponent(), match: instance.package}`,
                            content: 'text-match',
                          },
                          {
                            view: 'badge',
                            className: 'hack-badge-margin-left',
                            when: `instance.package.getInstanceInfo(instance.value.path, ${hash})`,
                            data: `{
                              text: instance.package.getInstanceInfo(instance.value.path, ${hash}).info.version
                            }`,
                          },
                          {
                            when: 'instance.reasons',
                            view: 'badge',
                            className: 'hack-badge-margin-left',
                            data: `{text: reasonModules.size(), postfix: reasonModules.size().plural(['module', 'modules'])}`,
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
