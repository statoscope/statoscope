import path from 'path';
import module from 'module';

export function normalizePath(source: string, rootDir: string): string {
  return source.replace('<rootDir>', rootDir);
}

export function makeRequireFromPath(pathname: string): NodeRequire {
  return module.createRequire(path.resolve(pathname, '_'));
}

export function resolveAliasPackage(
  prefixes: string[],
  name: string,
  fromDir: string
): string {
  const localRequire = makeRequireFromPath(fromDir);
  name = normalizePath(name, fromDir);

  if (name.startsWith('.') || path.isAbsolute(name)) {
    localRequire(name);
    return name;
  }

  let packageNamespace: string;
  let packageName: string;

  if (name.startsWith('@')) {
    [, packageNamespace = '', packageName = ''] = name.match(/(@.+?)[\\/](.+)/) ?? [];
  } else {
    packageNamespace = '';
    packageName = name;
  }

  const paths = [
    [name],
    ...prefixes.map((prefix) => [packageNamespace, `${prefix}-${packageName}`]),
  ].map((item) => path.join(...(item.filter(Boolean) as string[])));

  for (const item of paths) {
    try {
      localRequire(item);
      return item;
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  throw new Error(
    `Can't resolve ${name} with prefixes [${prefixes}].${
      !name.startsWith('.') ? 'Did you forget to install it?' : ''
    }`
  );
}
