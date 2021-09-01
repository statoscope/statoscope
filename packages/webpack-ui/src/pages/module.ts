import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './split-layout.css';
import modulesTree from './default/modules-tree';
import chunksTree from './default/chunks-tree';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('module', [
    {
      data: '#.params.hash.resolveStat()',
      view: 'switch',
      content: [
        {
          when: 'not compilation',
          content: 'stats-list',
        },
        {
          when: 'compilation',
          content: [
            {
              view: 'switch',
              data: `compilation.(..modules).[name=#.id.decodeURIComponent() or (''+id)=#.id.decodeURIComponent()][0]`,
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
                      content: 'h1:resolvedResource or name or id',
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
                              { value: 'issuers', text: 'Issuer Path' },
                              { value: 'chunks', text: 'Chunks' },
                              { value: 'entrypoints', text: 'Entrypoints' },
                            ],
                            content: {
                              view: 'content-filter',
                              content: {
                                view: 'switch',
                                content: [
                                  {
                                    when: '#.reasonsTabs="modules"',
                                    data: `
                                    $modules: reasons.resolvedModule.[];
                                    $modules.[not shouldHideModule() and name~=#.filter].sort(getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...modulesTree(),
                                    },
                                  },
                                  {
                                    when: '#.reasonsTabs="issuers"',
                                    data: `
                                    $module: $;
                                    $moduleGraph: #.params.hash.getModuleGraph();
                                    $entrypoints: #.params.hash.resolveCompilation().entrypoints;
                                    $issuerPath: (issuerPath.resolvedModule or [])
                                      .[not shouldHideModule() and name~=#.filter]
                                      .({type: 'module', item: $});
                                    $issuerPath.reverse() + 
                                    ($issuerPath[0].item or $module)
                                      .moduleGraph_getEntrypoints($moduleGraph, $entrypoints, 1)
                                      .({type: 'entry', item: $})
                                      .[item and name~=#.filter]
                                    `,
                                    content: {
                                      view: 'ul',
                                      item: {
                                        view: 'switch',
                                        content: [
                                          {
                                            when: `type='module'`,
                                            data: `item`,
                                            content:
                                              'module-item:{module:$,hash:#.params.hash}',
                                          },
                                          {
                                            when: `type='entry'`,
                                            data: `item`,
                                            content:
                                              'entry-item:{entrypoint:$,hash:#.params.hash}',
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  {
                                    when: '#.reasonsTabs="chunks"',
                                    data: `
                                    chunks
                                      .[chunkName()~=#.filter]
                                      .sort(initial desc, entry desc, getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...chunksTree(),
                                    },
                                  },
                                  {
                                    when: '#.reasonsTabs="entrypoints"',
                                    data: `
                                    $moduleGraph: #.params.hash.getModuleGraph();
                                    $entrypoints: #.params.hash.resolveCompilation().entrypoints;
                                    $module: $;
                                    $module.moduleGraph_getEntrypoints($moduleGraph, $entrypoints).[name~=#.filter].sort(data.isOverSizeLimit asc)
                                      .({ entry: $, $module })
                                    `,
                                    content: {
                                      view: 'tree',
                                      children: false,
                                      expanded: false,
                                      itemConfig: {
                                        children: `
                                          $moduleGraph: #.params.hash.getModuleGraph();
                                          $module: module;
                                          $entry: entry;
                                          [$module.moduleGraph_getPaths($moduleGraph, $entry.data.dep.module)]
                                            .[(..children).node.data.module.[name~=#.filter]]`,
                                        content: [
                                          {
                                            view: 'entry-item',
                                            data: '{entrypoint: entry, match:#.filter}',
                                          },
                                        ],
                                        itemConfig: {
                                          children:
                                            'children.[children and (..children).node.data.module.[name~=#.filter]]',
                                          content: {
                                            view: 'module-item',
                                            data: '{module: node.data.module, hash: #.params.hash, match:#.filter}',
                                          },
                                        },
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
                                    #.params.hash.resolveStat().compilation.(..modules)
                                      .[not shouldHideModule() and name~=#.filter]
                                      .[reasons.[resolvedModule=@]]
                                      .sort(getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...modulesTree(),
                                    },
                                  },
                                  {
                                    when: '#.depsTabs="chunks"',
                                    data: `
                                    #.params.hash.resolveStat().compilation.(..modules).[not shouldHideModule()]
                                      .[reasons.[resolvedModule=@]]
                                      .chunks.[chunkName()~=#.filter].sort(initial desc, entry desc, size desc)
                                    `,
                                    content: {
                                      ...chunksTree(),
                                    },
                                  },
                                  {
                                    when: '#.depsTabs="concatenated"',
                                    data: `
                                    modules.[not shouldHideModule() and name~=#.filter].sort(getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...modulesTree(),
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                    {
                      view: 'section',
                      header: 'text:"Messages"',
                      content: {
                        view: 'tabs',
                        name: 'messagesTabs',
                        tabs: [{ value: 'validation', text: 'Validation' }],
                        content: {
                          view: 'content-filter',
                          content: {
                            view: 'switch',
                            content: [
                              {
                                when: '#.messagesTabs="validation"',
                                content: {
                                  view: 'validation-messages',
                                  data: `
                                  $messages: #.params.hash.validation_getItems('module', name);
                                  $related: {type: 'module', id: name};
                                  { $messages, $related, showRelated: false }
                                  `,
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
  ]);
}
