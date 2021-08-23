import path from 'path';
import { Prepared } from '@statoscope/webpack-model';
import {
  NormalizedModule,
  NormalizedReason,
} from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/types/types/validation/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { WebpackRule } from '../../';
import { normalizePackageTarget, PackageTarget, RawTarget } from '../../helpers';
import { ExcludeItem, normalizeExclude } from '../../limits-helpers';
import * as version from '../../version';

export type PackageResultItem = {
  packageName: string;
  after: NormalizedReason[];
  reference: NormalizedReason[];
  diff: Array<{
    module: NormalizedModule;
    reasons: NormalizedReason[];
  }>;
};

export type RuleExcludeItem = ExcludeItem<'compilation'>;

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
): void {
  const query = `
  $after: resolveInputFile();
  $reference: resolveReferenceFile();
  $target: #.target;
  $exclude: #.exclude;
  
  $after.compilations
  .exclude({
    exclude: $exclude.[type='compilation'].name,
    get: <name>,
  })
  .nodeModules.[name.isMatch($target.name)]
  .({
    $instances: instances
    .[
      $passVersion: (not $target.version or not version).bool();
      $passVersion or version.semverSatisfies($target.version)
    ];
    package: $,
    $instances
  })
  .group(<package.name>)
  .({
    $key;
    $afterReasons: value.instances.modules.reasons;
    $referenceReasons: $reference.compilations
      .exclude({
        exclude: $exclude.[type='compilation'].name,
        get: <name>,
      })
      .(
        $compilation: $;
        $key.resolvePackage($compilation.hash)
      )
      .[]
      .instances
      .[
        $passVersion: (not $target.version or not version).bool();
        $passVersion or version.semverSatisfies($target.version)
      ]
      .modules.reasons;
    $diff: $afterReasons.[
      $item: $;
      not $referenceReasons[=>moduleName=$item.moduleName and userRequest=$item.userRequest and type=$item.type]
    ].group(<resolvedModule>).({module: key, reasons: value}).[reasons];
    packageName: key,
    reference: $referenceReasons,
    after: $afterReasons,
    $diff
  }).[diff]`;

  const result = data.query(query, data.files, {
    target,
    exclude: ruleParams.exclude,
  }) as PackageResultItem[];

  for (const packageItem of result) {
    if (packageItem.after.length > packageItem.reference.length) {
      api.message(
        `Usage of ${packageItem.packageName} was increased from ${packageItem.reference.length} to ${packageItem.after.length}`,
        {
          filename: data.files[0].name,
          related: [{ type: 'package', id: packageItem.packageName }],
          details: [
            {
              type: 'discovery',
              query: `
              $input: resolveInputFile();
              {
                package: $input.compilations.hash.(#.package.resolvePackage($)).pick(),
                before: #.before,
                after: #.after,
              }
              `,
              filename: path.basename(data.files[0].name),
              payload: {
                context: {
                  package: packageItem.packageName,
                  before: packageItem.reference.length,
                  after: packageItem.after.length,
                },
              },
            },
          ],
        }
      );
    }
  }
}

const diffDeprecatedPackages: WebpackRule<Params> = (ruleParams, data, api): void => {
  api.setRuleDescriptor({
    description:
      'Diff usage of specified packages usage between input and reference stats',
    package: version,
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

  if (!data.files.find((file) => file.name === 'reference.json')) {
    throw new Error('Reference-stats is not specified');
  }

  for (const target of normalizedRuleParams.target) {
    handleTarget(target, normalizedRuleParams, data, api);
  }
};

export default diffDeprecatedPackages;
