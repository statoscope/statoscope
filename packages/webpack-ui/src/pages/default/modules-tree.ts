export type ModuleTree = Record<string, unknown>;

export default (hash?: string): ModuleTree => {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: moduleItemConfig(void 0, hash),
  };
};

export type ModuleItemConfig = Record<string, unknown>;

export function moduleItemConfig(getter = '$', hash = '#.params.hash'): ModuleItemConfig {
  return {
    limit: '= settingListItemsLimit()',
    content: `module-item:{module: ${getter}, hash: ${hash}, match: #.filter}`,
    children: `
    $moduleGraph: ${hash}.getModuleGraph();
    $entrypoints: ${hash}.resolveCompilation().entrypoints;
    $module: ${getter};
    $issuerPath: ($module.issuerPath.resolvedModule or []).[not shouldHideModule()]
      .({
        type: 'module',
        item: $
      }).[item];
    $issuerPathWithEntry: $issuerPath.reverse() + 
      ($issuerPath[0].item or $module).moduleGraph_getEntrypoints($moduleGraph, $entrypoints, 1)
        .({type: 'entry', item: $})
        .[item];
    $reasonsModule: $module.reasons.resolvedModule.[].[not shouldHideModule()];
    [{
      title: "Reasons",
      data: $reasonsModule,
      issuerPath: $issuerPathWithEntry,
      visible: $reasonsModule or $issuerPathWithEntry,
      type: 'reasons'
    },
    {
      title: "Concatenated",
      data: ${getter}.modules.[not shouldHideModule()],
      visible: ${getter}.modules,
      type: 'concatenated'
    }].[visible]`,
    itemConfig: {
      view: 'switch',
      content: [
        {
          when: 'type="reasons"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `[{
              title: "Modules",
              data: data,
              visible: data,
              type: 'modules'
            }, {
              title: "Issuer Path",
              data: issuerPath,
              visible: issuerPath,
              type: 'issuers'
            }, {
              title: "Chunks",
              reasons: data,
              data: data.chunks.sort(initial desc, entry desc, size desc),
              visible: data,
              type: 'chunks'
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
                    get itemConfig(): ModuleItemConfig {
                      return moduleItemConfig();
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
                    children: `data.({value: $, reasons: @.reasons})`,
                    itemConfig: {
                      content: `chunk-item:{chunk: value, hash: ${hash}}`,
                      children: `reasons.[chunks has @.value]`,
                      limit: '= settingListItemsLimit()',
                      get itemConfig(): ModuleItemConfig {
                        return moduleItemConfig();
                      },
                    },
                  },
                },
                {
                  when: 'type="issuers"',
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
                    itemConfig: {
                      children: false,
                      content: [
                        {
                          when: `type='module'`,
                          view: 'module-item',
                          data: `{module: item, hash: ${hash}}`,
                        },
                        {
                          when: `type='entry'`,
                          view: 'entry-item',
                          data: `{entrypoint: item, hash: ${hash}}`,
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
        {
          when: 'type="concatenated"',
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
              return moduleItemConfig();
            },
          },
        },
      ],
    },
  };
}
