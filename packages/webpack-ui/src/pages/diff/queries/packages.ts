export default `
$addedPackages: ($statB.compilation.nodeModules.name - $statA.compilation.nodeModules.name)
  .({
    $hash: $statB.compilation.hash;
    hash: $hash,
    package: resolvePackage($hash)
  });
$removedPackages: ($statA.compilation.nodeModules.name - $statB.compilation.nodeModules.name)
  .({
    $hash: $statA.compilation.hash;
    hash: $hash,
    package: resolvePackage($hash)
  });
$intersectedPackages: $statA.compilation.nodeModules
  .({
    $packageA: $;
    $packageB: $packageA.name.resolvePackage($statB.compilation.hash);
    a: {package: $packageA, hash: $statA.compilation.hash},
    b: {package: $packageB, hash: $statB.compilation.hash},
  })
  .[b.package];

$packagesDiff: {
  added: $addedPackages.sort(package.instances.size() desc, name asc).({
    package,
    hash,
    instances: {
      added: package.instances.sort(isRoot desc, name asc),
      removed: []
    }
  }),
  removed: $removedPackages.sort(package.instances.size() desc, name asc).({
    package,
    hash,
    instances: {
      added: [],
      removed: package.instances.sort(isRoot desc, name asc),
    }
  }),
  changed: $intersectedPackages.sort(b.package.instances.added.size() desc, b.package.instances.removed.size() desc, b.package.name asc).({
    $a: a;
    $b: b;
    package: b.package,
    hash: b.hash,
    instances: {
      added: $b.package.instances
        .[not path in $a.package.instances.path].sort(isRoot desc, name asc),
      removed: $a.package.instances
        .[not path in $b.package.instances.path].sort(isRoot desc, name asc),
      changed: $a.package.instances.({
        $path: path;
        a: {instance: $a.package.name.getPackageInstanceInfo($path, $a.hash), hash: $a.hash},
        b: {instance: $b.package.name.getPackageInstanceInfo($path, $b.hash), hash: $b.hash}
      }).({
        $a: a;
        $b: b;
        ...b,
        diff: [{
          type: 'version',
          a: $a.instance.info.version,
          b: $b.instance.info.version,
        }].[a != b]
      })
      .sort(instance.isRoot desc, instance.path asc),
    }
  }).[instances.added or instances.removed or instances.changed.diff]
};
`;
