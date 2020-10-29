import styles from './split-layout.css';
import modulesTree from './default/modules-tree';
import chunksTree from './default/chunks-tree';

export default function (discovery) {
  discovery.page.define('module', (el, data, content) => {
    // el.classList.add(styles.root);
    discovery.view.render(
      el,
      [
        {
          view: 'switch',
          data: `#.data.(..modules).[identifier=#.id.decodeURIComponent() or (''+id)=#.id.decodeURIComponent()][0]`,
          content: [
            {
              when: 'not $',
              content:
                'alert-warning:"Module `" + #.id.decodeURIComponent() + "` not found"',
            },
            {
              content: [
                {
                  view: 'h1',
                  //className: styles.header,
                  content: [
                    'text:"Module"',
                    {
                      view: 'badge',
                      className: 'hack-badge-margin-left',
                      data: '{ text: moduleResource() or name or id }',
                    },
                  ],
                },
                {
                  ...modulesTree(),
                },
                {
                  view: 'block',
                  className: styles.root,
                  content: [
                    {
                      view: 'section',
                      header: 'text:"Reasons"',
                      content: {
                        view: 'tabs',
                        name: 'reasonsTabs',
                        tabs: [
                          { value: 'modules', text: 'Modules' },
                          { value: 'chunks', text: 'Chunks' },
                        ],
                        content: {
                          view: 'content-filter',
                          content: {
                            view: 'switch',
                            content: [
                              {
                                when: '#.reasonsTabs="modules"',
                                data: `
                                $module:reasons.[moduleIdentifier].moduleIdentifier.(resolveModule());
                                $module.[not shouldHideModule() and (not #.filter or name~=#.filter)].sort(moduleSize() desc)
                                `,
                                content: {
                                  view: 'list',
                                  limit: '= settingListItemsLimit()',
                                  get itemConfig() {
                                    return modulesTree();
                                  },
                                },
                              },
                              {
                                when: '#.reasonsTabs="chunks"',
                                data: `
                                chunks.(resolveChunk()).[not #.filter or chunkName()~=#.filter].sort(initial desc, entry desc, size desc)
                                `,
                                content: {
                                  view: 'list',
                                  limit: '= settingListItemsLimit()',
                                  get itemConfig() {
                                    return chunksTree();
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                    {
                      view: 'section',
                      header: 'text:"Dependencies"',
                      content: {
                        view: 'tabs',
                        name: 'depsTabs',
                        tabs: [
                          { value: 'modules', text: 'Modules' },
                          { value: 'chunks', text: 'Chunks' },
                          {
                            when: 'modules',
                            value: 'concatenated',
                            text: 'Concatenated',
                          },
                        ],
                        content: {
                          view: 'content-filter',
                          content: {
                            view: 'switch',
                            content: [
                              {
                                when: '#.depsTabs="modules"',
                                data: `
                                #.data.(..modules).[not shouldHideModule() and (not #.filter or name~=#.filter)].[reasons.[moduleIdentifier.resolveModule()=@]].sort(moduleSize() desc)
                                `,
                                content: {
                                  view: 'list',
                                  limit: '= settingListItemsLimit()',
                                  get itemConfig() {
                                    return modulesTree();
                                  },
                                },
                              },
                              {
                                when: '#.depsTabs="chunks"',
                                data: `
                                #.data.(..modules).[not shouldHideModule()]
                                  .[reasons.[moduleIdentifier.resolveModule()=@]]
                                  .chunks.(resolveChunk()).[not #.filter or chunkName()~=#.filter].sort(initial desc, entry desc, size desc)
                                `,
                                content: {
                                  view: 'list',
                                  limit: '= settingListItemsLimit()',
                                  get itemConfig() {
                                    return chunksTree();
                                  },
                                },
                              },
                              {
                                when: '#.depsTabs="concatenated"',
                                data: `
                                modules.[not shouldHideModule() and (not #.filter or name~=#.filter)].sort(moduleSize() desc)
                                `,
                                content: {
                                  view: 'list',
                                  limit: '= settingListItemsLimit()',
                                  get itemConfig() {
                                    return modulesTree();
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      data,
      content
    );
  });
}
