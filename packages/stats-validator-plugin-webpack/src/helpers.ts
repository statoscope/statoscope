import makeJoraHelpers, { SerializedStringOrRegexp } from '@statoscope/helpers/dist/jora';

const joraHelpers = makeJoraHelpers();

export type ModuleTarget = {
  name: string | RegExp;
};

export type PackageTarget = {
  name: string | RegExp;
  version?: string;
  description?: string;
  analogs?: string[];
};

export type SerializedPackageTarget = {
  name: SerializedStringOrRegexp;
  version?: string;
};

export type SerializedModuleTarget = {
  name: SerializedStringOrRegexp;
};

export type RawTarget<TTarget> = string | RegExp | TTarget;

// packageName, packageVersion
export const packageRx = /^(@.+?[/\\][^/\\\s@]+|[^/\\\s@]+)(?:@(.+))?/;

export function makePackageTarget(
  name: string | RegExp,
  version?: string
): PackageTarget {
  return {
    name,
    version,
  };
}

export function serializePackageTarget(target: PackageTarget): SerializedPackageTarget {
  return {
    name: joraHelpers.serializeStringOrRegexp(target.name)!,
    version: target.version,
  };
}

export function normalizePackageTarget(item: RawTarget<PackageTarget>): PackageTarget {
  if (typeof item === 'string') {
    const [, packageName, packageVersion] = item.match(packageRx) || [];
    return makePackageTarget(packageName, packageVersion);
  } else if (item instanceof RegExp) {
    return makePackageTarget(item);
  }

  return item;
}

export function makeModuleTarget(name: string | RegExp): ModuleTarget {
  return {
    name,
  };
}

export function serializeModuleTarget(target: ModuleTarget): SerializedModuleTarget {
  return {
    name: joraHelpers.serializeStringOrRegexp(target.name)!,
  };
}

export function normalizeModuleTarget(item: RawTarget<ModuleTarget>): ModuleTarget {
  if (typeof item === 'string' || item instanceof RegExp) {
    return makeModuleTarget(item);
  }

  return item;
}
