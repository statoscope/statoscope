import styles from './default.css';
import entryTree, { entryItemConfig } from './default/entry-tree';

function statsSelect(value, onChange) {
  return {
    view: 'select',
    placeholder: 'choose a stat',
    value: value,
    data: 'values().hash',
    onChange,
  };
}

export default function (discovery) {
  discovery.page.define('diff', [
    {
      view: 'switch',
      content: [
        {
          content: [
            {
              view: 'page-header',
              content: 'h1:"Stats diff"',
            },
            {
              view: 'block',
              className: styles.root,
              content: [
                {
                  view: 'block',
                  content: [
                    statsSelect('#.params.hash', (value) => {
                      const context = discovery.getRenderContext();
                      const link = discovery.encodePageHash(context.page, context.id, {
                        ...context.params,
                        hash: value,
                      });
                      location.assign(link);
                    }),
                  ],
                },
                {
                  view: 'block',
                  content: [
                    statsSelect('#.params.diffWith', (value) => {
                      const context = discovery.getRenderContext();
                      const link = discovery.encodePageHash(context.page, context.id, {
                        ...context.params,
                        diffWith: value,
                      });
                      location.assign(link);
                    }),
                  ],
                },
              ],
            },
            {
              view: 'block',
              data: `
                $a:#.params.hash.resolveStats();
                $b:#.params.diffWith.resolveStats();
                $added:($a.entrypoints.keys() - $b.entrypoints.keys()).({name:$,data:$a.entrypoints[$]});
                $removed:($b.entrypoints.keys() - $a.entrypoints.keys()).({name:$,data:$b.entrypoints[$]});
                [
                  {
                    type: "changed",
                    title: "Changed",
                    visible: 1,
                    data: []
                  },
                  {
                    type: "added",
                    title: "Added",
                    visible: $added,
                    data: $added
                  },
                  {
                    type: "removed",
                    title: "Removed",
                    visible: $removed,
                    data: $removed
                  }
                ].[visible]`,
              content: [
                {
                  view: 'tree',
                  expanded: false,
                  itemConfig: {
                    view: 'switch',
                    content: [
                      {
                        when: 'type="changed"',
                        content: {
                          view: 'tree-leaf',
                          content: 'text:title',
                          children: `data`,
                          itemConfig: {
                            content: 'entry-item:{entrypoint:$}',
                          },
                        },
                      },
                      {
                        when: 'type="added"',
                        content: {
                          view: 'tree-leaf',
                          content: 'text:title',
                          children: `data`,
                          get itemConfig() {
                            return entryTree();
                          },
                        },
                      },
                      {
                        when: 'type="removed"',
                        content: {
                          view: 'tree-leaf',
                          content: 'text:title',
                          children: `data`,
                          get itemConfig() {
                            return entryItemConfig(void 0, '#.params.diffWith');
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
}
