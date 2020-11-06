export default () => {
  return {
    view: 'tree',
    expanded: false,
    itemConfig: moduleItemConfig(),
  };
};

export function moduleItemConfig(getter = '$') {
  return {
    content: `module-item:{module: ${getter}, match: #.filter}`,
    children: `
    $reasonsModule:${getter}.reasons.[moduleIdentifier].moduleIdentifier.(resolveModule(#.params.hash)).[not shouldHideModule()];
    [{
      title: "Reasons",
      data: $reasonsModule,
      visible: $reasonsModule,
      type: 'reasons'
    }, {
      title: "Concatenated",
      data: ${getter}.modules.[not shouldHideModule()].sort(moduleSize() desc),
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
              title: "Chunks",
              reasons: data,
              data: data.chunks.(resolveChunk(#.params.hash)).sort(initial desc, entry desc, size desc),
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
                    get itemConfig() {
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
                      content: 'chunk-item:{chunk: value}',
                      children: `reasons.[chunks has @.value.id]`,
                      limit: '= settingListItemsLimit()',
                      get itemConfig() {
                        return moduleItemConfig();
                      },
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
            get itemConfig() {
              return moduleItemConfig();
            },
          },
        },
      ],
    },
  };
}
