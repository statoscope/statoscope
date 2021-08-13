import path from 'path';
import chalk from 'chalk';
import { Prepared } from '@statoscope/webpack-model';
import {
  NodeModuleInstance,
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
  NormalizedPackage,
} from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/types/types/validation';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { WebpackRule } from '../../';
import {
  normalizePackageTarget,
  PackageTarget,
  RawTarget,
  serializePackageTarget,
} from '../../helpers';
import { RuleExcludeItem } from '../diff-deprecated-packages';
import { normalizeExclude, serializeExclude } from '../../limits-helpers';

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
  $input: resolveInputFile();
  $target: #.target;
  $exclude: #.exclude;
  
  $input.group(<compilations>)
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
        ].sort(isRoot desc, path.size() asc)
    })
  })
  .[packages.instances]`;
  const result = data.query(query, data.files, {
    target,
    exclude: ruleParams.exclude,
  }) as PackageResultItem[];

  for (const resultItem of result) {
    for (const packageItem of resultItem.packages) {
      const instances = packageItem.instances;
      const versions = instances.map((item) => item.version).filter(Boolean);
      api.error(
        `${packageItem.package.name}${
          versions.length ? `@${versions.join(', ')}` : ''
        } should not be used`,
        {
          filename: resultItem.file.name,
          compilation: resultItem.compilation.name || resultItem.compilation.hash,
          details: [
            { type: 'text', content: makeInstanceDetailsContent(instances, false) },
            { type: 'tty', content: makeInstanceDetailsContent(instances, true) },
            {
              type: 'discovery',
              query,
              filename: path.basename(resultItem.file.name ?? data.files[0].name),
              serialized: {
                context: {
                  target: serializePackageTarget(target),
                  exclude: ruleParams.exclude.map(serializeExclude),
                },
              },
              deserialize: {
                type: 'query',
                content: `
                $theContext: context;
                {
                  context: {
                    target: {
                      name: $theContext.target.name.deserializeStringOrRegexp(),
                      version: $theContext.target.version,
                    },
                    exclude: $theContext.exclude.(deserializeStringOrRegexp),
                  }
                }`,
              },
            },
          ],
          related: [
            { type: 'package', id: packageItem.package.name },
            ...instances.map(
              (item) => ({ type: 'package-instance', id: item.path } as const)
            ),
          ],
        }
      );
    }
  }

  return result;
}

function makeInstanceDetailsContent(
  instances: NodeModuleInstance[],
  tty: boolean
): string[] {
  const ctx = new chalk.Instance(tty ? {} : { level: 0 });
  return [
    'Instances:',
    ...instances.map(
      (instance) =>
        `- ${instance.path}  ${instance.version ? ctx.yellow(instance.version) : ''}`
    ),
  ];
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
