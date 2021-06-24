export default `
$statA: #.params.hash.resolveStat();
$statB: #.params.diffWith.resolveStat();

$statsACompressed: $statA.file.__statoscope.compilations.modules.source.sizes.[compressor].size();
$statsBCompressed: $statB.file.__statoscope.compilations.modules.source.sizes.[compressor].size();
$useCompressedSize: settingShowCompressed() and $statsACompressed and $statsBCompressed;

$getChunksAssetsSize: => (
  files.[].(getAssetSize($$, $useCompressedSize))
);


$chunksAllA: $statA.compilation.chunks;
$chunksAllB: $statB.compilation.chunks;
$chunksInitialA: $chunksAllA.[initial];
$chunksInitialB: $chunksAllB.[initial];
$chunksAsyncA: $chunksAllA.[not initial];
$chunksAsyncB: $chunksAllB.[not initial];

$assetsAllSizeA: $chunksAllA.$getChunksAssetsSize($statA.compilation.hash).reduce(=> size + $$, 0);
$assetsAllSizeB: $chunksAllB.$getChunksAssetsSize($statB.compilation.hash).reduce(=> size + $$, 0);
$assetsInitialSizesA: $chunksInitialA.$getChunksAssetsSize($statA.compilation.hash);
$assetsInitialSizeA: $assetsInitialSizesA.reduce(=> size + $$, 0);
$assetsInitialSizesB: $chunksInitialB.$getChunksAssetsSize($statB.compilation.hash);
$assetsInitialSizeB: $assetsInitialSizesB.reduce(=> size + $$, 0);
$assetsAsyncSizeA: $chunksAsyncA.$getChunksAssetsSize($statA.compilation.hash).reduce(=> size + $$, 0);
$assetsAsyncSizeB: $chunksAsyncB.$getChunksAssetsSize($statB.compilation.hash).reduce(=> size + $$, 0);

$downloadTimeA: $assetsInitialSizesA
  .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
  .getDownloadTime();
$downloadTimeB: $assetsInitialSizesB
  .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
  .getDownloadTime();

[
  {
    $value: $assetsInitialSizeB - $assetsInitialSizeA;
    $valueP: $assetsInitialSizeB.percentFrom($assetsInitialSizeA);
    value: $value,
    valueP: $valueP,
    valueText: $value.formatSize(),
    valueTextP: $valueP.toFixed() + '%',
    label: 'Initial size',
    visible: $value
  },
  {
    $value: $downloadTimeB - $downloadTimeA;
    $valueP: $downloadTimeB.percentFrom($downloadTimeA);
    value: $value,
    valueP: $valueP,
    valueText: $value.formatDuration(),
    valueTextP: $valueP.toFixed() + '%',
    label: 'Initial download',
    visible: $value
  },
  {
    $value: $assetsAllSizeB - $assetsAllSizeA;
    $valueP: $assetsAllSizeB.percentFrom($assetsAllSizeA);
    value: $value,
    valueP: $valueP,
    valueText: $value.formatSize(),
    valueTextP: $valueP.toFixed() + '%',
    label: "Total size",
    visible: $value
  },
  {
    $value: $assetsAsyncSizeB - $assetsAsyncSizeA;
    $valueP: $assetsAsyncSizeB.percentFrom($assetsAsyncSizeA);
    value: $value,
    valueP: $valueP,
    valueText: $value.formatSize(),
    valueTextP: $valueP.toFixed() + '%',
    label: "Async size",
    visible: $value
  },
  {
    $value: $statB.compilation.time - $statA.compilation.time;
    $valueP: $statB.compilation.time.percentFrom($statA.compilation.time);
    value: $value,
    valueP: $valueP,
    valueText: $value.formatDuration(),
    valueTextP: $valueP.toFixed() + '%',
    label: 'Build Time',
    visible: $value
  },
  {
    $a: $statA.compilation.nodeModules.size();
    $b: $statB.compilation.nodeModules.size();
    $value: $b - $a;
    $valueP: $b.percentFrom($a);
    value: $value,
    valueP: $valueP,
    valueText: $value,
    valueTextP: $valueP.toFixed() + '%',
    label: 'Packages',
    visible: $value
  },
  {
    $packagesWithMultipleInstancesA: $statA.compilation.nodeModules.[instances.size() > 1];
    $packagesWithMultipleInstancesB: $statB.compilation.nodeModules.[instances.size() > 1];
    $a: $packagesWithMultipleInstancesA.instances.size() - $packagesWithMultipleInstancesA.size();
    $b: $packagesWithMultipleInstancesB.instances.size() - $packagesWithMultipleInstancesB.size();
    $value: $b - $a;
    $valueP: $b.percentFrom($a);
    value: $value,
    valueP: $valueP,
    valueText: $value,
    valueTextP: $valueP.toFixed() + '%',
    label: 'Package copies',
    visible: $value
  },
  {
    $packagesSizeA: $statA.compilation.nodeModules.instances.modules.(getModuleSize($statA.compilation.hash, $useCompressedSize)).reduce(=> size + $$, 0);
    $packagesSizeB: $statB.compilation.nodeModules.instances.modules.(getModuleSize($statB.compilation.hash, $useCompressedSize)).reduce(=> size + $$, 0);
    $value: $packagesSizeB - $packagesSizeA;
    $valueP: $packagesSizeB.percentFrom($packagesSizeA);
    value: $value,
    valueP: $valueP,
    valueText: $value.formatSize(),
    valueTextP: $valueP.toFixed() + '%',
    label: 'Packages size',
    visible: $value
  },
  {
    $a: $statA.compilation.entrypoints.size();
    $b: $statB.compilation.entrypoints.size();
    $value: $b - $a;
    $valueP: $b.percentFrom($a);
    value: $value,
    valueP: $valueP,
    valueText: $value,
    valueTextP: $valueP.toFixed() + '%',
    label: 'Entrypoints',
    visible: $value
  },
  {
    $a: ($statA.compilation..modules).size();
    $b: ($statB.compilation..modules).size();
    $value: $b - $a;
    $valueP: $b.percentFrom($a);
    value: $value,
    valueP: $valueP,
    valueText: $value,
    valueTextP: $valueP.toFixed() + '%',
    label: 'Modules',
    visible: $value
  },
  {
    $getDuplicateModules: => (
      $duplicates: (..modules).[source].group(<source>)
        .({source: key, duplicates: value})
        .[duplicates.size() > 1].(
          $module: duplicates[0];
          $dups: duplicates - [duplicates[0]];
          {
            module: $module,
            duplicates: $dups
          }
        );
      $duplicates.module.size()
    );
    $a: $statA.compilation.$getDuplicateModules();
    $b: $statB.compilation.$getDuplicateModules();
    $value: $b - $a;
    $valueP: $b.percentFrom($a);
    value: $value,
    valueP: $valueP,
    valueText: $value,
    valueTextP: $valueP.toFixed() + '%',
    label: 'Duplicate modules',
    visible: $value
  },
  {
    $a: ($statA.compilation.chunks + $statA.compilation.chunks..children).size();
    $b: ($statB.compilation.chunks + $statB.compilation.chunks..children).size();
    $value: $b - $a;
    $valueP: $b.percentFrom($a);
    value: $value,
    valueP: $valueP,
    valueText: $value,
    valueTextP: $valueP.toFixed() + '%',
    label: 'Chunks',
    visible: $value
  },
  {
    $a: $statA.compilation.assets.size();
    $b: $statB.compilation.assets.size();
    $value: $b - $a;
    $valueP: $b.percentFrom($a);
    value: $value,
    valueP: $valueP,
    valueText: $value,
    valueTextP: $valueP.toFixed() + '%',
    label: 'Assets',
    visible: $value
  },
]
`;
