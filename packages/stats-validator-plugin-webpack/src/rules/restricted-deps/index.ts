import { Prepared } from '@statoscope/webpack-model';
import {
  NodeModuleInstance,
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
  NormalizedPackage,
} from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/stats-validator/dist/api';
import chalk from 'chalk';
import { WebpackRule } from '../../';

export type PackageResultItem = {
  file: NormalizedFile;
  compilation: NormalizedCompilation;
  packages: Array<{
    package: NormalizedPackage;
    instances: Array<NodeModuleInstance>;
  }>;
};

export type ModuleResultItem = {
  file: NormalizedFile;
  compilation: NormalizedCompilation;
  modules: Array<NormalizedModule>;
};

export type Params = Array<string | RegExp | ModuleTarget | PackageTarget>;
export type ModuleTarget = { type: 'module'; name: string | RegExp };
export type PackageTarget = {
  type: 'package';
  name: string | RegExp;
  version?: string;
};
export type Target = ModuleTarget | PackageTarget;

const packageRx = /^(@.+?[/\\][^/\\\s@]+|[^/\\\s@]+)(?:@(.+))?/;

function handledModules(
  target: ModuleTarget,
  data: Prepared,
  api: API
): ModuleResultItem[] {
  const pass = (a: string): boolean =>
    target.name instanceof RegExp ? target.name.test(a) : a === target.name;
  const result = data.query(
    `
        $pass: #.pass;
        .group(<compilations>)
          .({file: value.pick(), compilation: key})
          .({
            ...$,
            modules: compilation..modules.[name.$pass()]
          }).[modules]
        `,
    data.files,
    { target, pass }
  ) as ModuleResultItem[];

  for (const resultItem of result) {
    for (const module of resultItem.modules) {
      api.error(`${module.name} should not be used`, {
        filename: resultItem.file.name,
        compilation: resultItem.compilation.name || resultItem.compilation.hash,
      });
    }
  }

  return result;
}

function handlePackages(
  target: PackageTarget,
  data: Prepared,
  api: API
): PackageResultItem[] {
  const result = data.query(
    `
        $target: #;
        .group(<compilations>)
        .({file:value.pick(), compilation:key})
        .({
          ...$,
          packages: compilation.nodeModules
          .[name.isMatch($target.name)]
          .({
            $package: $;
            $package,
            instances: instances
              .[
                $passVersion: (not $target.version or not version).bool();
                $passVersion or version.semverSatisfies($target.version)
              ]
          })
        })
        .[packages.instances]`,
    data.files,
    target
  ) as PackageResultItem[];

  for (const resultItem of result) {
    for (const packageItem of resultItem.packages) {
      for (const instance of packageItem.instances) {
        api.error(
          `${packageItem.package.name}${
            instance.version ? `@${instance.version}` : ''
          } should not be used`,
          {
            filename: resultItem.file.name,
            compilation: resultItem.compilation.name || resultItem.compilation.hash,
            details: [
              { type: 'text', content: makeInstanceDetailsContent(instance, false) },
              { type: 'tty', content: makeInstanceDetailsContent(instance, true) },
            ],
          }
        );
      }
    }
  }

  return result;
}

function makeInstanceDetailsContent(instance: NodeModuleInstance, tty: boolean): string {
  const ctx = new chalk.Instance(tty ? {} : { level: 0 });
  return `Instance: ${instance.path}  ${ctx.yellow(instance.version) ?? ''}`;
}

function makePackageTarget(name: string | RegExp, version?: string): PackageTarget {
  return {
    type: 'package',
    name,
    version,
  };
}

function makePackageTargetFromString(name: string): PackageTarget {
  const [, packageName, packageVersion] = name.match(packageRx) || [];

  return makePackageTarget(packageName, packageVersion);
}

function makeModuleTarget(name: string | RegExp): ModuleTarget {
  return {
    type: 'module',
    name,
  };
}

const disallowedDeps: WebpackRule<Params> = (ruleParams, data, api): void => {
  const targets: Target[] = ruleParams.map((item): Target => {
    if (item instanceof RegExp || (typeof item === 'string' && item.startsWith('.'))) {
      return makeModuleTarget(item);
    }

    if (typeof item === 'string') {
      return makePackageTargetFromString(item);
    }

    return item;
  });

  for (const target of targets) {
    if (target.type === 'module') {
      handledModules(target, data, api);
    }

    if (target.type === 'package') {
      handlePackages(target, data, api);
    }
  }
};

export default disallowedDeps;
