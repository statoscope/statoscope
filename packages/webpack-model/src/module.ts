import { Webpack } from '../webpack';
import { NormalizedModule, NormalizedReason } from '../types';
import RawModule = Webpack.RawModule;
import Reason = Webpack.Reason;

export const extractFileRx = /!?([^!]+)$/;
export const concatenatedIdRx = /(.+) \+ \d+ modules$/;

export function matchRxValue(rx: RegExp, string: string): string | null {
  const [, match] = string.match(rx) || [];
  return match || null;
}

export function moduleNameResource(name: string | null): string | null {
  if (name && !name.includes('(ignored)') && !name.startsWith('multi')) {
    const normalized = matchRxValue(
      extractFileRx,
      name.replace('(webpack)', 'node_modules/webpack')
    );

    if (!normalized) {
      return name;
    }

    const nameResource = matchRxValue(concatenatedIdRx, normalized) || normalized;

    if (nameResource.startsWith('./') || nameResource.startsWith('.\\')) {
      return nameResource.slice(2);
    }

    return nameResource;
  }

  return null;
}

export function moduleResource(
  module: RawModule | NormalizedModule | null
): string | null {
  return moduleNameResource(module && module.name);
}

export function moduleReasonResource(
  reason: Reason | NormalizedReason | null
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
  const isRoot = input
    ? !/.*(?:^|[/\\])node_modules[/\\].+[/\\]node_modules[/\\]/.test(input)
    : false;
  return name ? { path: input, name, isRoot } : null;
}
