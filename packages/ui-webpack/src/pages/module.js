import styles from './split-layout.css';
import modulesTree from './default/modules-tree';
import chunksTree from './default/chunks-tree';

export default function (discovery) {
  discovery.page.define('module', [
    {
      data: '#.params.hash.resolveStats()',
      view: 'switch',
      content: [
        {
          when: 'not $',
          content: 'stats-list',
        },
        {
          when: '$',
          content: [
            {
              when: 'not __validation.result',
              view: 'alert-danger',
              data: `__validation.message`,
            },
            {
              view: 'switch',
              data: `(..modules).[identifier=#.id.decodeURIComponent() or (''+id)=#.id.decodeURIComponent()][0]`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"Module `" + #.id.decodeURIComponent() + "` not found"',
                },
                {
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Module" }',
                      content: 'h1:moduleResource() or name or id',
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
                                    $module:reasons.[moduleIdentifier].moduleIdentifier.(resolveModule(#.params.hash));
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
                                    chunks.(resolveChunk(#.params.hash))
                                      .[not #.filter or chunkName()~=#.filter]
                                      .sort(initial desc, entry desc, size desc)
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
                                    #.params.hash.resolveStats().(..modules)
                                      .[not shouldHideModule() and (not #.filter or name~=#.filter)]
                                      .[reasons.[moduleIdentifier.resolveModule(#.params.hash)=@]]
                                      .sort(moduleSize() desc)
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
                                    #.params.hash.resolveStats().(..modules).[not shouldHideModule()]
                                      .[reasons.[moduleIdentifier.resolveModule(#.params.hash)=@]]
                                      .chunks.(resolveChunk(#.params.hash)).[not #.filter or chunkName()~=#.filter].sort(initial desc, entry desc, size desc)
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
        },
      ],
    },
  ]);
}
