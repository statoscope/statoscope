export default `
$aModules: $statA.compilation.modules.[not shouldHideModule()];
$bModules: $statB.compilation.modules.[not shouldHideModule()];

$addedModules: $bModules.[not identifier.resolveModule($statA.compilation.hash)].({module: $, hash: $statB.compilation.hash});
$removedModules: $aModules.[not identifier.resolveModule($statB.compilation.hash)].({module: $, hash: $statA.compilation.hash});
$intersectedModules: $statA.compilation.modules.({
  $moduleA: $;
  $moduleB: $moduleA.identifier.resolveModule($statB.compilation.hash);
  a: {module: $moduleA, hash: $statA.compilation.hash},
  b: {module: $moduleB, hash: $statB.compilation.hash},
}).[b.module];

$modulesDiff: {
  added: $addedModules
    .({
      $moduleSize: module.getModuleSize(hash, $useCompressedSize).size;
      module,
      hash,
      diff: [
        {
          type: 'size',
          a: 0,
          b: $moduleSize
        }
      ]
      .[a != b]
    })
    .sort(diff.[type='size'].pick().b desc),
  removed: $removedModules
    .({
      $moduleSize: module.getModuleSize(hash, $useCompressedSize).size;
      module,
      hash,
      diff: [
        {
          type: 'size',
          a: $moduleSize,
          b: 0
        }
      ]
      .[a != b]
    })
    .sort(diff.[type='size'].pick().a desc),
  changed: $intersectedModules
    .({
      $a: a;
      $b: b;
      $moduleASize: $a.module.getModuleSize($a.hash, $useCompressedSize).size;
      $moduleBSize: $b.module.getModuleSize($b.hash, $useCompressedSize).size;
      ...b,
      diff: [
        {
          type: 'size',
          a: $moduleASize,
          b: $moduleBSize
        },
        {
          type: 'number',
          a: $a.module.modules.size(),
          b: $b.module.modules.size(),
          plural: { words: ['concated module', 'concated modules'] }
        }
      ].[a != b],
    })
    .[diff.size()]
};
`;
