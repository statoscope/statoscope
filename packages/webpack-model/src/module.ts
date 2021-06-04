import { Webpack } from '../webpack';
import { NormalizedModule, NormalizedReason } from './normalize';

export const extractFileRx = /.*(?:^|!|\s+)(\.?\.?[\\/].+)/;
export const concatenatedIdRx = /(.+) \+ \d+ modules$/;
export const contextIdRx = /(.+) (?:sync|eager|weak|async-weak|lazy|lazy-once)(?:\s|$)/;

export function matchRxValue(rx: RegExp, string: string): string | null {
  const [, match] = string.match(rx) || [];
  return match || null;
}

export function moduleNameResource(name: string | null): string | null {
  if (name && !name.includes('(ignored)') && !name.startsWith('multi')) {
    const normalized = matchRxValue(
      extractFileRx,
      name.replace('(webpack)', '/node_modules/webpack')
    );

    if (!normalized) {
      return name;
    }

    const nameResource =
      matchRxValue(concatenatedIdRx, normalized) ||
      matchRxValue(contextIdRx, normalized) ||
      normalized;

    if (nameResource.startsWith('./') || nameResource.startsWith('.\\')) {
      return nameResource.slice(2);
    }

    return nameResource;
  }

  return null;
}

export function moduleResource(
  module: NormalizedModule | Webpack.Module | null
): string | null {
  return moduleNameResource(module && module.name);
}

export function moduleReasonResource(
  reason: NormalizedReason | Webpack.Reason | null
): string | null {
  return moduleNameResource(reason && reason.moduleName);
}
export type NodeModule = {
  path: string;
  name: string;
  isRoot: boolean;
};

export function nodeModule(path: string | null): NodeModule | null {
  if (!path) {
    return null;
  }

  const lastNodeModulesRx =
    /.*(?:^|[/\\])node_modules[/\\](@.+?[/\\][^/\\\s]+|[^/\\\s]+)/;
  const [input, name] = path.match(lastNodeModulesRx) || [];
  const isRoot = input ? !input.match(/\/node_modules\/.+\/node_modules\//) : false;
  return name ? { path: input, name, isRoot } : null;
}
