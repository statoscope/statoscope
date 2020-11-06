import styles from './default.css';

import packagesTree from './default/packages-tree';
import modulesTree from './default/modules-tree';
import chunksTree from './default/chunks-tree';
import entryTree from './default/entry-tree';
import assetsTree from './default/assets-tree';

const indicatorList = (data) => ({
  view: 'inline-list',
  data,
  item: {
    view: 'indicator',
    data: `
    .({
      label: title,
      value: query.query(#.params.hash.resolveStats(), #)
      // href: "#" + pageRef
    })`,
  },
});

export default function (discovery) {
  discovery.page.define('default', [
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
              view: 'page-header',
              prelude: [
                {
                  when: 'version',
                  view: 'badge',
                  data: `{prefix:'webpack version',text:version}`,
                },
                {
                  when: 'hash',
                  view: 'badge',
                  data: `{prefix:'hash',text:hash}`,
                },
              ],
              content: 'h1:#.name',
            },
            {
              view: 'block',
              className: styles.root,
              content: [
                {
                  view: 'section',
                  header: 'text:"Input"',
                  content: [
                    indicatorList([
                      {
                        title: 'Entrypoints',
                        query: 'entrypoints.size()',
                        /*pageRef: 'entries',*/
                      },
                      {
                        title: 'Modules',
                        query:
                          'modules.[not shouldHideModule()].size()' /*pageRef: 'modules'*/,
                      },
                      {
                        title: 'Files',
                        query:
                          'modules.[not shouldHideModule()].(moduleResource()).[$].size()',
                        /*pageRef: 'files',*/
                      },
                    ]),
                    indicatorList([
                      {
                        title: 'Packages',
                        query: 'nodeModules.size()',
                        /*pageRef: 'packages',*/
                      },
                      {
                        title: 'Package copies',
                        query: `
                        $duplicatesPackages:nodeModules.[instances.size() > 1];
                        $duplicatesPackages.instances.size() - $duplicatesPackages.size()
                        `,
                        /*pageRef: 'packages',*/
                      },
                    ]),
                  ],
                },
                {
                  view: 'section',
                  header: 'text:"Output"',
                  data: [
                    {
                      title: 'Chunk groups',
                      query: 'namedChunkGroups.size()',
                      /*pageRef: 'chunkGroups',*/
                    },
                    { title: 'Chunks', query: 'chunks.size()' /*pageRef: 'chunks'*/ },
                    { title: 'Assets', query: 'assets.size()' /*pageRef: 'assets'*/ },
                  ],
                  content: {
                    view: 'inline-list',
                    item: 'indicator',
                    data: `.({
                      label: title,
                      value: query.query(#.params.hash.resolveStats(), #)
                      // href: "#" + pageRef
                    })`,
                  },
                },
              ],
            },
            {
              view: 'block',
              content: [
                {
                  view: 'section',
                  header: 'text:"Instant lists"',
                  content: {
                    view: 'tabs',
                    name: 'instantLists',
                    tabs: [
                      { value: 'entrypoints', text: 'Entrypoints' },
                      { value: 'modules', text: 'Modules' },
                      { value: 'chunks', text: 'Chunks' },
                      { value: 'assets', text: 'Assets' },
                      { value: 'packages', text: 'Packages' },
                    ],
                    content: {
                      view: 'content-filter',
                      content: {
                        view: 'switch',
                        content: [
                          {
                            when: '#.instantLists="modules"',
                            data: `
                            modules.[not shouldHideModule()].[
                              name and 
                              (no #.filter or name~=#.filter or modules.name~=#.filter)
                            ]
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
                            when: '#.instantLists="chunks"',
                            data: `
                            chunks.sort(initial desc, entry desc, size desc).[
                              (no #.filter or names.[$~=#.filter] or reason~=#.filter or id~=#.filter)
                            ]
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
                            when: '#.instantLists="assets"',
                            data: `
                            assets.[
                              name and 
                              (no #.filter or name~=#.filter)
                            ]
                            .sort(isOverSizeLimit asc, size desc)
                            `,
                            content: {
                              view: 'list',
                              limit: '= settingListItemsLimit()',
                              get itemConfig() {
                                return assetsTree();
                              },
                            },
                          },
                          {
                            when: '#.instantLists="entrypoints"',
                            data: `
                            entrypoints.entries()
                              .({name: key, data: value})
                              .[no #.filter or name~=#.filter or data.assets.[$~=#.filter]]
                              .sort(data.isOverSizeLimit asc, size desc)
                            `,
                            content: {
                              view: 'list',
                              limit: '= settingListItemsLimit()',
                              get itemConfig() {
                                return entryTree();
                              },
                            },
                          },
                          {
                            when: '#.instantLists="packages"',
                            data: `
                            nodeModules
                              .[no #.filter or name~=#.filter]
                              .sort(instances.size() desc, name asc)
                            `,
                            content: {
                              view: 'list',
                              limit: '= settingListItemsLimit()',
                              get itemConfig() {
                                return packagesTree();
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
  ]);
}
