export default `
$getDuplicateModules: => (
  $compilation: $;
  (..modules)
    .[source and not shouldHideModule() and name~=#.filter]
    .group(<source>)
    .({source: key, duplicates: value})
    .[duplicates.size() > 1]
    .(
      $module: duplicates[0];
      $instance: $module.resolvedResource.nodeModule();
      $package: $instance.name.resolvePackage($compilation.hash);
      $dupModules: duplicates - [duplicates[0]];
      {
        module: $module,
        hash: $compilation.hash,
        instance: $instance,
        isLocal: not $instance,
        dupModules: $dupModules.({
          $instance: resolvedResource.nodeModule();
          module: $,
          instance: $instance,
          isLocal: not $instance
        })
        .sort(isLocal desc, instance.isRoot desc, module.name desc)
      }
    )
    .sort(isLocal desc, dupModules.size() desc, instance.isRoot desc, module.name desc)
);
$dupModulesA: $statA.compilation.$getDuplicateModules();
$dupModulesB: $statB.compilation.$getDuplicateModules();

$dupModulesDiff: {
  added: $dupModulesB.[module.name not in $dupModulesA.module.name],
  removed: $dupModulesA.[module.name not in $dupModulesB.module.name],
};
`;
