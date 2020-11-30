import { moduleItemConfig } from './modules-tree';

export default (hash) => ({
  view: 'tree',
  expanded: false,
  limitLines: '= settingListItemsLimit()',
  itemConfig: packageItemConfig(hash),
});

export function packageInstanceTree(hash) {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: packageInstanceItemConfig(void 0, hash),
  };
}

export function packageItemConfig(hash) {
  return {
    limit: '= settingListItemsLimit()',
    children: 'instances.sort(size() asc, $ asc).({instance: $, package: @.name})',
    content: `package-item:{package:$, hash: ${hash}, match: #.filter}`,
    get itemConfig() {
      return packageInstanceItemConfig(void 0, hash);
    },
  };
}

export function packageInstanceItemConfig(hash = '#.params.hash') {
  return {
    content: {
      view: 'link',
      data: `{
        text: instance.path,
        href: package.pageLink("package", {instance: instance.path, hash:${hash}}),
        match: package
      }`,
      content: 'text-match',
    },
    children: `[{
        title: "Reasons",
        data: instance.reasons,
        type: 'reasons'
      },{
        title: "Modules",
        data: instance.modules.[not shouldHideModule()].sort(moduleSize() desc),
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
                children: $reasonsWithModule.module.[not shouldHideModule()].sort(moduleSize() desc),
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
                        $chunks.module.({value: $, reasons: $chunks.reason}).sort(value.moduleSize() desc)
                        `,
                      limit: '= settingListItemsLimit()',
                      get itemConfig() {
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
                    get itemConfig() {
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
                      ],
                      children: `
                        instances.(
                          $instance: $;
                          {
                            instance: $instance,
                            reasonModules: reasons.[not module.shouldHideModule() and reason.moduleReasonResource().nodeModule().path=$instance.value.path]
                              .group(<module>).({module:key,reasons:value.reason}).sort(module.moduleSize() desc)
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
                            when: 'instance.reasons',
                            view: 'badge',
                            className: 'hack-badge-margin-left',
                            data: `{text: reasonModules.size(), postfix: reasonModules.size().plural(['module', 'modules'])}`,
                          },
                        ],
                        children: `reasonModules`,
                        limit: '= settingListItemsLimit()',
                        get itemConfig() {
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
            get itemConfig() {
              return moduleItemConfig(void 0, hash);
            },
          },
        },
      ],
    },
  };
}
