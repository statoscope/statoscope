import chalk from 'chalk';
import { Prepared } from '@statoscope/webpack-model';
import {
  NodeModuleInstance,
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
  NormalizedPackage,
} from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/types/types/validation/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import {
  DetailsDescriptorDiscovery,
  DetailsDescriptorText,
  DetailsDescriptorTTY,
} from '@statoscope/types/types/validation/test-entry';
import { WebpackRule } from '../../';
import { normalizePackageTarget, PackageTarget, RawTarget } from '../../helpers';
import { RuleExcludeItem } from '../diff-deprecated-packages';
import { normalizeExclude } from '../../limits-helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json');

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

      const messageDetails = [
        {
          type: 'text' as DetailsDescriptorText['type'],
          content: makeDetailsContent(target, instances),
        },
        {
          type: 'tty' as DetailsDescriptorTTY['type'],
          content: makeDetailsContent(target, instances, true),
        },
        {
          type: 'discovery' as DetailsDescriptorDiscovery['type'],
          query: `
              $input: resolveInputFile();
              {
                package: #.package.resolvePackage(#.compilation),
              }
              `,
          payload: {
            context: {
              compilation: resultItem.compilation.hash,
              package: packageItem.package.name,
            },
          },
        },
      ];

      api.message(
        `${packageItem.package.name}${
          versions.length ? `@${versions.join(', ')}` : ''
        } should not be used`,
        {
          filename: resultItem.file.name,
          compilation: resultItem.compilation.hash,
          details: messageDetails,
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

/**
 * Return list of strings to be rendered with:
 *  - deprecation message defined in the rule target
 *  - list of package instances found in the bundle
 *  - list of alternative packages provided in the rule target
 */
function makeDetailsContent(
  target: PackageTarget,
  instances: NodeModuleInstance[],
  tty = false
): string[] {
  const { description } = target;

  const content = description ? [description] : [];

  const ctx = new chalk.Instance(tty ? {} : { level: 0 });
  const instancesContent = [
    'Instances:',
    ...instances.map(
      (instance) =>
        `- ${instance.path}  ${instance.version ? ctx.yellow(instance.version) : ''}`
    ),
  ];

  content.push(...instancesContent);

  const { analogs } = target;

  if (analogs?.length) {
    content.push('Consider using alternative packages:');

    content.push(...analogs.map((analog) => `- ${analog}`));
  }

  return content;
}

const restrictedPackages: WebpackRule<Params> = (ruleParams, data, api): void => {
  api.setRuleDescriptor({
    description: `Ensures that bundle doesn't use specified packages`,
    package: {
      author: version.author,
      description: version.description,
      homepage: version.homepage,
      name: version.name,
      version: version.version,
    },
  });

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
