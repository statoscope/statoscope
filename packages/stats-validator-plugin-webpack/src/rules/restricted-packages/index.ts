import chalk from 'chalk';
import { Prepared } from '@statoscope/webpack-model';
import {
  NodeModuleInstance,
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
  NormalizedPackage,
} from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { WebpackRule } from '../../';
import { normalizePackageTarget, PackageTarget, RawTarget } from '../../helpers';
import { RuleExcludeItem } from '../diff-deprecated-packages';
import { normalizeExclude } from '../../limits-helpers';

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

export type NormalizedParams = {
  target: PackageTarget[];
  exclude: RuleExcludeItem[];
};
export type Params =
  | RawTarget<PackageTarget>[]
  | {
      target: RawTarget<PackageTarget>[] | NormalizedParams['target'];
      exclude: Array<string | RegExp | RuleExcludeItem> | NormalizedParams['exclude'];
    };

function handleTarget(
  target: PackageTarget,
  ruleParams: NormalizedParams,
  data: RuleDataInput<Prepared>,
  api: API
): PackageResultItem[] {
  const query = `
  $target: #.target;
  $exclude: #.exclude;
  
  .group(<compilations>)
  .({file: value.pick(), compilation: key})
  .exclude({
    exclude: $exclude.[type='compilation'].name,
    get: <compilation.name>,
  })
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
  .[packages.instances]`;
  const result = data.input.query(query, data.input.files, {
    target,
    exclude: ruleParams.exclude,
  }) as PackageResultItem[];

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
            related: [{ type: 'package-instance', id: instance.path }],
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

const restrictedPackages: WebpackRule<Params> = (ruleParams, data, api): void => {
  const normalizedRuleParams: NormalizedParams | null = ruleParams
    ? Array.isArray(ruleParams)
      ? { exclude: [], target: ruleParams.map(normalizePackageTarget) }
      : {
          exclude: ruleParams.exclude.map((item) =>
            normalizeExclude(item, 'compilation')
          ),
          target: ruleParams.target.map(normalizePackageTarget),
        }
    : null;

  if (!normalizedRuleParams?.target.length) {
    throw new Error('Deprecated deps is not specified');
  }

  for (const target of normalizedRuleParams.target) {
    handleTarget(target, normalizedRuleParams, data, api);
  }
};

export default restrictedPackages;
