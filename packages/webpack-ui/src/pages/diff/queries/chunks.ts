export default `
$addedChunks: $statB.compilation.chunks.[not id.resolveChunk($statA.compilation.hash)].({
  chunk: $, hash: $statB.compilation.hash
});
$removedChunks: $statA.compilation.chunks.[not id.resolveChunk($statB.compilation.hash)].({
  chunk: $, hash: $statA.compilation.hash
});
$intersectedChunks: $statA.compilation.chunks.({
  $chunkA: $;
  $chunkB: $chunkA.id.resolveChunk($statB.compilation.hash);
  a: {chunk: $chunkA, hash: $statA.compilation.hash},
  b: {chunk: $chunkB, hash: $statB.compilation.hash},
}).[b.chunk];

$chunksDiff: {
  added: $addedChunks
    .({
      $hash: hash;
      $chunkSize: chunk.size;
      $chunkFilesSizes: chunk.files.[].[not name.shouldExcludeResource()].(getAssetSize($hash, $useCompressedSize));
      $chunkFilesSize: $chunkFilesSizes.reduce(=> size + $$, 0);
      chunk,
      hash,
      modules: {
          added: chunk.modules
      },
      diff: [
        {
          type: 'size',
          a: 0,
          b: $chunkSize
        },
        {
          id: 'assetsSize',
          type: 'size',
          title: 'assets',
          a: 0,
          b: $chunkFilesSize
        },
        {
          type: 'time',
          title: 'download',
          a: 0,
          b: $chunkFilesSizes
            .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
            .getDownloadTime()
        }
      ]
      .[a != b]
    })
    .sort(diff.[id='assetsSize'].pick().b desc),
  removed: $removedChunks
    .({
      $hash: hash;
      $chunkSize: chunk.size;
      $chunkFilesSizes: chunk.files.[].[not name.shouldExcludeResource()].(getAssetSize($hash, $useCompressedSize));
      $chunkFilesSize: $chunkFilesSizes.reduce(=> size + $$, 0);
      chunk,
      hash,
      modules: {
          removed: chunk.modules
      },
      diff: [
        {
          type: 'size',
          a: $chunkSize,
          b: 0,
        },
        {
          id: 'assetsSize',
          type: 'size',
          title: 'assets',
          a: $chunkFilesSize,
          b: 0
        },
        {
          type: 'time',
          title: 'download',
          a: $chunkFilesSizes
            .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
            .getDownloadTime(),
          b: 0,
        }
      ]
      .[a != b]
    })
    .sort(diff.[id='assetsSize'].pick().b desc),
  changed: $intersectedChunks
    .({
      $a: a;
      $b: b;
      $chunkASize: $a.chunk.size;
      $chunkAFileSizes: $a.chunk.files.[].[not name.shouldExcludeResource()].(getAssetSize($a.hash, $useCompressedSize));
      $chunkAFileSize: $chunkAFileSizes.reduce(=> size + $$, 0);
      $chunkBSize: $b.chunk.size;
      $chunkBFileSizes: $b.chunk.files.[].[not name.shouldExcludeResource()].(getAssetSize($b.hash, $useCompressedSize));
      $chunkBFileSize: $chunkBFileSizes.reduce(=> size + $$, 0);
      ...b,
      modules: {
          added: $b.chunk..modules
            .[not identifier.resolveModule($statA.compilation.hash) in $a.chunk..modules],
          removed: $a.chunk..modules
            .[not identifier.resolveModule($statB.compilation.hash) in $b.chunk..modules],
          changed: $a.chunk.modules.({
            $moduleA: $;
            $moduleB: $moduleA.identifier.resolveModule($statB.compilation.hash);
            a: {module: $moduleA, hash: $statA.compilation.hash},
            b: {module: $moduleB, hash: $statB.compilation.hash},
          }).[b.module].({
            $a: a;
            $b: b;
            ...b.module,            
            diff: [{
              type: 'size',
              a: $a.module.getModuleSize($a.hash, $useCompressedSize).size,
              b: $b.module.getModuleSize($b.hash, $useCompressedSize).size,
            }].[a != b]
          }).[diff]
      },
      diff: [
        {
          type: 'size',
          a: $chunkASize,
          b: $chunkBSize
        },
        {
          type: 'size',
          title: 'assets',
          a: $chunkAFileSize,
          b: $chunkBFileSize
        },
        {
          type: 'time',
          title: 'download',
          a: $chunkAFileSizes
            .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
            .getDownloadTime(),
          b: $chunkBFileSizes
            .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
            .getDownloadTime(),
        },
        {
          type: 'number',
          a: $a.chunk.modules.size(),
          b: $b.chunk.modules.size(),
          plural: { words: ['module', 'modules'] }
        }
      ].[a != b],
    })
    .[diff.size()]
};
`;
