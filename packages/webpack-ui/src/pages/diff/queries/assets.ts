export default `
$addedAssets: $statB.compilation.assets.[not name.resolveAsset($statA.compilation.hash)].({asset: $, hash: $statB.compilation.hash});
$removedAssets: $statA.compilation.assets.[not name.resolveAsset($statB.compilation.hash)].({asset: $, hash: $statA.compilation.hash});
$intersectedAssets: $statA.compilation.assets.({
  $assetA: $;
  $assetB: $assetA.name.resolveAsset($statB.compilation.hash);
  a: {asset: $assetA, hash: $statA.compilation.hash},
  b: {asset: $assetB, hash: $statB.compilation.hash},
}).[b.asset];

$assetsDiff: {
  added: $addedAssets
    .({
      $assetSize: asset.getAssetSize(hash, $useCompressedSize).size;
      asset,
      hash,
      diff: [
        {
          type: 'size',
          a: 0,
          b: $assetSize
        },
        {
          type: 'time',
          title: 'download',
          a: 0,
          b: $assetSize.getDownloadTime()
        }
      ]
      .[a != b]
    })
    .sort(asset.isOverSizeLimit asc, diff.[type='size'].pick().b desc),
  removed: $removedAssets
    .({
      $assetSize: asset.getAssetSize(hash, $useCompressedSize).size;
      asset,
      hash,
      diff: [
        {
          type: 'size',
          a: $assetSize,
          b: 0
        },
        {
          type: 'time',
          title: 'download',
          a: $assetSize.getDownloadTime(),
          b: 0
        }
      ]
      .[a != b]
    })
    .sort(asset.isOverSizeLimit asc, diff.[type='size'].pick().a desc),
  changed: $intersectedAssets
    .({
      $a: a;
      $b: b;
      $assetASize: $a.asset.getAssetSize($a.hash, $useCompressedSize).size;
      $assetBSize: $b.asset.getAssetSize($b.hash, $useCompressedSize).size;
      ...b,
      diff: [
        {
          type: 'size',
          a: $assetASize,
          b: $assetBSize
        },
        {
          type: 'time',
          title: 'download',
          a: $assetASize.getDownloadTime(),
          b: $assetBSize.getDownloadTime(),
        },
        {
          type: 'number',
          a: $a.asset.chunks.size(),
          b: $b.asset.chunks.size(),
          plural: { words: ['chunk', 'chunks'] }
        }
      ].[a != b],
    })
    .[diff.size()]
};
`;
