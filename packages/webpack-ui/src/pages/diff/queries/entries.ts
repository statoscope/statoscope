export default `
$getEntryChunksSizes: => (
  files.[not name.shouldExcludeResource()].[].(getAssetSize($$, $useCompressedSize))
);

$addedEntrypoints: $statB.compilation.entrypoints.[
  $name: name;
  not $statA.compilation.entrypoints.[name=$name].pick()
].({
  entry: $,
  hash: $statB.compilation.hash
});
$removedEntrypoints: $statA.compilation.entrypoints.[
  $name: name;
  not $statB.compilation.entrypoints.[name=$name].pick()
].({
  entry: $,
  hash: $statA.compilation.hash
});
$intersectedEntrypoints: $statA.compilation.entrypoints.({
  $entryA: $;
  $entryB: $statB.compilation.entrypoints.[name=$entryA.name].pick();
  a: {entry: $entryA, hash: $statA.compilation.hash},
  b: {entry: $entryB, hash: $statB.compilation.hash},
}).[b.entry];

$entryDiff: {
  added: $addedEntrypoints
    .({
      $chunksAll: entry.data.chunks + entry.data.chunks.[not isRuntime]..children;
      $chunksInitial: $chunksAll.[initial];
      $chunksAsync: $chunksAll.[not initial];

      $assetsAllSize: $chunksAll.$getEntryChunksSizes(hash).reduce(=> size + $$, 0);
      $assetsInitialSizes: $chunksInitial.$getEntryChunksSizes(hash);
      $assetsInitialSize: $assetsInitialSizes.reduce(=> size + $$, 0);
      $assetsAsyncSize: $chunksAsync.$getEntryChunksSizes(hash).reduce(=> size + $$, 0);

      $downloadTime: $assetsInitialSizes
        .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
        .getDownloadTime();
      entry,
      hash,
      diff: [
        {
          id: 'initialSize',
          type: 'size',
          title: 'initial assets',
          a: 0,
          b: $assetsInitialSize
        },
        {
          type: 'time',
          title: 'initial download',
          a: 0,
          b: $downloadTime
        },
        {
          type: 'size',
          title: 'all assets',
          a: 0,
          b: $assetsAllSize
        },
        {
          type: 'size',
          title: 'async assets',
          a: 0,
          b: $assetsAsyncSize
        },
      ]
      .[a != b]
    })
    .sort(entry.isOverSizeLimit asc, diff.[id='initialSize'].pick().b desc),
  removed: $removedEntrypoints
    .({
      $chunksAll: entry.data.chunks + entry.data.chunks.[not isRuntime]..children;
      $chunksInitial: $chunksAll.[initial];
      $chunksAsync: $chunksAll.[not initial];

      $assetsAllSize: $chunksAll.$getEntryChunksSizes(hash).reduce(=> size + $$, 0);
      $assetsInitialSizes: $chunksInitial.$getEntryChunksSizes(hash);
      $assetsInitialSize: $assetsInitialSizes.reduce(=> size + $$, 0);
      $assetsAsyncSize: $chunksAsync.$getEntryChunksSizes(hash).reduce(=> size + $$, 0);

      $downloadTime: $assetsInitialSizes
        .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
        .getDownloadTime();
      entry,
      hash,
      diff: [
        {
          id: 'initialSize',
          type: 'size',
          title: 'initial assets',
          a: $assetsInitialSize,
          b: 0,
        },
        {
          type: 'time',
          title: 'initial download',
          a: $downloadTime,
          b: 0,
        },
        {
          type: 'size',
          title: 'all assets',
          a: $assetsAllSize,
          b: 0,
        },
        {
          type: 'size',
          title: 'async assets',
          a: $assetsAsyncSize,
          b: 0,
        },
      ]
      .[a != b]
    })
    .sort(entry.isOverSizeLimit asc, diff.[id='initialSize'].pick().b desc),
  changed: $intersectedEntrypoints
    .({
      $a: a;
      $b: b;
    
      $chunksAllA: $a.entry.data.chunks + $a.entry.data.chunks.[not isRuntime]..children;
      $chunksAllB: $b.entry.data.chunks + $b.entry.data.chunks.[not isRuntime]..children;

      $chunksInitialA: $chunksAllA.[initial];
      $chunksInitialB: $chunksAllB.[initial];

      $chunksAsyncA: $chunksAllA.[not initial];
      $chunksAsyncB: $chunksAllB.[not initial];

      $assetsAllSizeA: $chunksAllA.$getEntryChunksSizes($a.hash).reduce(=> size + $$, 0);
      $assetsAllSizeB: $chunksAllB.$getEntryChunksSizes($b.hash).reduce(=> size + $$, 0);

      $assetsInitialSizesA: $chunksInitialA.$getEntryChunksSizes($a.hash);
      $assetsInitialSizeA: $assetsInitialSizesA.reduce(=> size + $$, 0);
      $assetsInitialSizesB: $chunksInitialB.$getEntryChunksSizes($b.hash);
      $assetsInitialSizeB: $assetsInitialSizesB.reduce(=> size + $$, 0);

      $assetsAsyncSizeA: $chunksAsyncA.$getEntryChunksSizes($a.hash).reduce(=> size + $$, 0);
      $assetsAsyncSizeB: $chunksAsyncB.$getEntryChunksSizes($b.hash).reduce(=> size + $$, 0);

      $downloadTimeA: $assetsInitialSizesA
        .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
        .getDownloadTime();
      $downloadTimeB: $assetsInitialSizesB
        .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
        .getDownloadTime();
      
      ...b,
      diff: [
        {
          id: 'initialSize',
          type: 'size',
          title: 'initial assets',
          a: $assetsInitialSizeA,
          b: $assetsInitialSizeB,
        },
        {
          type: 'time',
          title: 'initial download',
          a: $downloadTimeA,
          b: $downloadTimeB,
        },
        {
          type: 'size',
          title: 'all assets',
          a: $assetsAllSizeA,
          b: $assetsAllSizeB,
        },
        {
          $chunksInitialA,
          $chunksInitialB,
          $chunksAsyncA,
          $chunksAsyncB,
          type: 'size',
          title: 'async assets',
          a: $assetsAsyncSizeA,
          b: $assetsAsyncSizeB,
        },
      ].[a != b],
    })
    .[diff.size()]
};
`;
