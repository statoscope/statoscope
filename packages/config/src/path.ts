import path from 'path';
import module from 'module';
import chalk from 'chalk';

export enum PackageAliasPrefixType {
  plugin = 'plugin',
  reporter = 'reporter',
}

export function normalizePath(source: string, rootDir: string): string {
  return source.replace('<rootDir>', rootDir);
}

export function makeRequireFromPath(pathname: string): NodeRequire {
  return module.createRequire(path.resolve(pathname, '_'));
}

// package namespace (empty string when not set) followed by the package name (wo namespace)
type PackageName = [string, string];

const packageAliasPrefixes = new Map<PackageAliasPrefixType, PackageName[]>();

packageAliasPrefixes.set(PackageAliasPrefixType.plugin, [
  // only used for alias starting with `@statoscope`, has to be first
  ['@statoscope', 'stats-validator-plugin'],
  ['', 'statoscope-stats-validator-plugin'],
]);

packageAliasPrefixes.set(PackageAliasPrefixType.reporter, [
  ['@statoscope', 'stats-validator-reporter'],
  ['', 'statoscope-stats-validator-reporter'],
]);

/**
 * Concatenate namespace (when provided) with the package name.
 */
function getFullPackageName([namespace, name]: PackageName): string {
  if (namespace) {
    return `${namespace}/${name}`;
  }

  return name;
}

/**
 * Return error message based on the list of package aliases (provided by the user and alternative).
 */
function getAliasPackageResolutionError(packageAliases: PackageName[]): string {
  const providedAlias = getFullPackageName(packageAliases[0]);

  let errorMessage = `Can't resolve package ${chalk.yellow.italic(providedAlias)}.\n`;

  const { italic: italicChalk } = chalk;

  if (packageAliases.length > 1) {
    const alternativeAlias = getFullPackageName(packageAliases[1]);

    errorMessage += `Also tried to resolve it with ${italicChalk.yellow(
      alternativeAlias
    )} alias which didn't work either.\n\n`;
  } else {
    errorMessage += '\n\n';
  }

  const greyChalk = chalk.bgKeyword('grey');

  errorMessage += 'Try installing the package locally:\n';
  errorMessage += `- with ${italicChalk('npm')}: ${greyChalk(
    'npm i -D ' + providedAlias
  )} (or corresponding package alias)\n`;
  errorMessage += `- with ${italicChalk('yarn')}: ${greyChalk(
    'yarn add -D ' + providedAlias
  )} (or corresponding package alias)\n`;

  return errorMessage;
}

/**
 * Resolve full or short package name to it's absolute path.
 * @param packageAliasType - Plugin or reporter enum.
 * @param aliasName - Package name (alias). Can be passed in the "full" or "short" form.
 *   Will append prefixes based on packageAliasType value in order to resolve the short form alias.
 * @param fromDir - Directory used as "root" while resolving the package.
 */
export function resolveAliasPackage(
  packageAliasType: PackageAliasPrefixType,
  aliasName: string,
  fromDir: string
): string {
  const localRequire = makeRequireFromPath(fromDir);
  aliasName = normalizePath(aliasName, fromDir);

  if (aliasName.startsWith('.') || path.isAbsolute(aliasName)) {
    localRequire(aliasName);
    return aliasName;
  }

  let packageNamespace = '';
  let packageName = aliasName;

  const packageNameRegex = /^(@.+?)\/(.+)/;

  if (packageNameRegex.test(aliasName)) {
    [, packageNamespace = '', packageName] = aliasName.match(packageNameRegex)!;
  }

  // can have from one up to two entries
  const packageAliases: PackageName[] = [
    [packageNamespace, packageName], // original form
  ];

  const prefixes = packageAliasPrefixes.get(packageAliasType)!;

  // we don't want to apply namespace specific (@statoscope) prefixes to no namespace or
  // custom namespaces aliases
  // hence once we find a namespace match (@statoscope) we skip no-namespace prefixes
  let skipNoNamespaceAliases = false;

  for (const [prefixNamespace, prefix] of prefixes) {
    if (
      (!skipNoNamespaceAliases && !prefixNamespace) ||
      prefixNamespace === packageNamespace
    ) {
      // @statoscope prefix is being used
      if (!skipNoNamespaceAliases && prefixNamespace) {
        skipNoNamespaceAliases = true;
      }

      if (!packageName.startsWith(prefix)) {
        packageAliases.push([packageNamespace, `${prefix}-${packageName}`]);
        break;
      }
    }
  }

  const paths = packageAliases.map(([namespace, packageName]) =>
    path.join(namespace, packageName)
  );

  for (const path of paths) {
    try {
      localRequire(path);
      return path;
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  throw new Error(getAliasPackageResolutionError(packageAliases));
}
