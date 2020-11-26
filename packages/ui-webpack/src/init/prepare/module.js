export const extractFileRx = /.*(?:(?:^|!|\s+)\.?[\\/])(.+)/;
export const concatenatedIdRx = /(.+) \+ \d+ modules$/;
export const contextIdRx = /(.+) (?:sync|eager|weak|async-weak|lazy|lazy-once)(?:\s|$)/;

export function matchRxValue(rx, string) {
  const [, match] = string.match(rx) || [];
  return match;
}

export function moduleNameResource(name) {
  if (name && !name.includes('(ignored)') && !name.startsWith('multi')) {
    const normalized = matchRxValue(
      extractFileRx,
      name.replace('(webpack)', '/node_modules/webpack')
    );

    if (!normalized) {
      return name;
    }

    return (
      matchRxValue(concatenatedIdRx, normalized) ||
      matchRxValue(contextIdRx, normalized) ||
      normalized
    );
  }
}

export default function moduleResource(module) {
  return moduleNameResource(module && module.name);
}

export function moduleReasonResource(reason) {
  return moduleNameResource(reason && reason.moduleName);
}

export function nodeModule(path) {
  if (!path) {
    return null;
  }

  const lastNodeModulesRx = /.*(?:^|[/\\])node_modules[/\\](@.+?[/\\][^/\\\s]+|[^/\\\s]+)/;
  const [input, name] = path.match(lastNodeModulesRx) || [];
  const isRoot = input ? !input.match(/\/node_modules\/.+\/node_modules\//) : false;
  return name ? { path: input, name, isRoot } : null;
}
