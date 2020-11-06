import { moduleItemConfig } from './modules-tree';

export default () => ({
  view: 'tree',
  expanded: false,
  itemConfig: packageItemConfig(),
});

export function packageInstanceTree() {
  return {
    view: 'tree',
    expanded: false,
    itemConfig: packageInstanceItemConfig(),
  };
}

export function packageItemConfig() {
  return {
    children: 'instances.sort(size() asc, $ asc).({instance: $, package: @.name})',
    content: 'package-item:{package:$}',
    get itemConfig() {
      return packageInstanceItemConfig();
    },
  };
}

export function packageInstanceItemConfig() {
  return {
    // content: 'text-match:{text: instance.path, match: package}',
    content: {
      view: 'link',
      data: `{
        text: instance.path,
        href: package.pageLink("package", {instance: instance.path, hash:#.params.hash}),
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
              $reasonsWithModule:data.[type='module'].data.({reason: $, module: moduleIdentifier.resolveModule(#.params.hash)});
              [{
                title: "Chunks",
                reasons: $reasonsWithModule,
                children: $reasonsWithModule.reason.moduleIdentifier.(resolveModule(#.params.hash)).[not shouldHideModule()].chunks.(resolveChunk(#.params.hash)).sort(initial desc, entry desc, size desc),
                type: 'chunk'
              }, {
                title: "Modules",
                children: $reasonsWithModule.reason.moduleIdentifier.(resolveModule(#.params.hash)).[not shouldHideModule()].sort(moduleSize() desc),
                type: 'module'
              }, {
                title: "Packages",
                reasons: $reasonsWithModule,
                children: $reasonsWithModule.reason.moduleName.(nodeModule()).name.[$],
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
                      content: 'chunk-item:{chunk: value}',
                      children: `
                        $chunks:reasons.[module.chunks has @.value.id];
                        $chunks.module.({value: $, reasons: $chunks.reason}).sort(value.moduleSize() desc)
                        `,
                      limit: '= settingListItemsLimit()',
                      get itemConfig() {
                        return moduleItemConfig('value');
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
                      return moduleItemConfig();
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
                        instances: resolvePackage(#.params.hash).instances.({value: $, reasons: @.reasons, package: $child})
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
                          href: value.pageLink("package", {hash:#.params.hash}),
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
                          return moduleItemConfig('module');
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
              return moduleItemConfig();
            },
          },
        },
      ],
    },
  };
}
