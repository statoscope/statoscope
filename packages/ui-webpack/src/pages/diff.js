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
                $intersect:$a.entrypoints.keys().[$ in $b.entrypoints.keys()];
                [
                  {
                    type: "changed",
                    title: "Changed",
                    visible: 1,
                    data: $intersect.(
                      $entryA:$a.entrypoints[$];
                      $entryB:$b.entrypoints[$];
                      $aData:{
                        initialSize: $entryA.chunks.(resolveChunk(#.params.hash)).[initial].files.(resolveAsset(#.params.hash)).[$].size.reduce(=> $ + $$, 0),
                        initialAssets: $entryA.chunks.(resolveChunk(#.params.hash)).[initial].files.(resolveAsset(#.params.hash)),
                        initialChunks: $entryA.chunks.(resolveChunk(#.params.hash)).[initial]
                      };
                      $bData:{
                        initialSize: $entryB.chunks.(resolveChunk(#.params.diffWith)).[initial].files.(resolveAsset(#.params.diffWith)).[$].size.reduce(=> $ + $$, 0),
                        initialAssets: $entryB.chunks.(resolveChunk(#.params.diffWith)).[initial].files.(resolveAsset(#.params.diffWith)),
                        initialChunks: $entryB.chunks.(resolveChunk(#.params.diffWith)).[initial]
                      };
                      
                      $chunksData:{
                        added:($aData.initialChunks.id - $bData.initialChunks.id).(resolveChunk(#.params.hash)),
                        removed:($bData.initialChunks.id - $aData.initialChunks.id).(resolveChunk(#.params.diffWith)),
                        changed:$aData.initialChunks.[id in $bData.initialChunks.id]
                          .(
                            $chunk:$;
                            $intersectedModules:$.(..modules)
                            .(
                              $module:$;
                              {
                                a:$module,
                                b:$bData.initialChunks.[id=$chunk.id].(..modules).[identifier=$module.identifier].pick()
                              }
                            ).[b];
                            {
                              chunk: $chunk,
                              addedModules: ($.(..modules).identifier - $bData.initialChunks.[id=$chunk.id].(..modules).identifier).(resolveModule(#.params.hash)),
                              removedModules: ($bData.initialChunks.[id=$chunk.id].(..modules).identifier- $.(..modules).identifier).(resolveModule(#.params.diffWith)),
                              changedModules: $intersectedModules.(
                                $module:a;
                                $moduleADeps:$a.(..modules).[reasons.[moduleIdentifier.resolveModule(#.params.hash).identifier=$module.identifier]];
                                $moduleBDeps:$b.(..modules).[reasons.[moduleIdentifier.resolveModule(#.params.diffWith).identifier=$module.identifier]];
                                $addedDeps: $moduleADeps.identifier - $moduleBDeps.identifier;
                                $removedDeps: $moduleBDeps.identifier - $moduleADeps.identifier;
                                {
                                  module: $module,
                                  size: a.size - b.size,
                                  deps: {
                                    addedDeps: $addedDeps.(resolveModule(#.params.hash)),
                                    removedDeps: $removedDeps.(resolveModule(#.params.diffWith))
                                  }
                                }
                              ).[size or deps.addedDeps or deps.removedDeps]
                            }
                          ).[addedModules or removedModules or changedModules]
                      };
                      
                      {
                        name: $,
                        entrySize: $aData.initialSize - $bData.initialSize,
                        chunks: $chunksData
                      }
                    )
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
                            content: 'struct',
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
