import { Prepared } from '@statoscope/webpack-model';
import { NormalizedReason, NormalizedModule } from '@statoscope/webpack-model/types';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { API } from '@statoscope/types/types/validation/api';
import { WebpackRule } from '../../';
import { ModuleTarget, normalizeModuleTarget, RawTarget } from '../../helpers';
import { ExcludeItem, normalizeExclude } from '../../limits-helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json');

export type ModuleResultItem = {
  module: NormalizedModule;
  diff: NormalizedReason[];
  after: NormalizedReason[];
  reference: NormalizedReason[];
};

export type RuleExcludeItem = ExcludeItem<'compilation'>;

export type Params =
  | RawTarget<ModuleTarget>[]
  | {
      target: RawTarget<ModuleTarget>[];
      exclude: Array<string | RegExp | RuleExcludeItem>;
    };

export type NormalizedParams = {
  target: ModuleTarget[];
  exclude: RuleExcludeItem[];
};

function handledModules(
  target: ModuleTarget,
  ruleParams: NormalizedParams,
  data: RuleDataInput<Prepared>,
  api: API,
): void {
  // todo make diff lazy
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
  ..modules.[name.isMatch($target.name)]
  .group(<identifier>)
  .({
    $key;
    $iReasons: value.reasons;
    $rReasons: $reference.compilations
    .(
      $compilation: $;
      $key.resolveModule($compilation.hash)
    ).[].reasons;
    $diff: $iReasons.({
      $ir: $;
      iReason: $ir,
      rReason: $rReasons[=>$ir.moduleIdentifier = moduleIdentifier and $ir.type = type and $ir.userRequest = userRequest]
    }).[not rReason].(iReason);
    module: value.pick(),
    after: $iReasons,
    reference: $rReasons,
    $diff
  }).[diff]
  `;
  const result = data.query(query, data.files, {
    target,
    exclude: ruleParams.exclude,
  }) as ModuleResultItem[];

  for (const item of result) {
    if (item.after.length > item.reference.length) {
      api.message(
        `Usage of ${item.module.name} was increased from ${item.reference.length} to ${item.after.length}`,
        {
          filename: data.files[0].name,
          related: [{ type: 'module', id: item.module.identifier }],
          details: [
            {
              type: 'discovery',
              query: `
              $input: resolveInputFile();
              {
                module: $input.compilations.hash.(#.module.resolveModule($)).pick(),
                diff: #.diff.({
                  $reason: $;
                  ...$,
                  resolvedModule: $input.compilations.hash.($reason.moduleIdentifier.resolveModule($)).pick(),
                  resolvedEntry: $input.compilations.hash.($reason.resolvedEntryName.resolveEntrypoint($)).pick(),
                }),
                before: #.before,
                after: #.after,
              }
              `,
              payload: {
                context: {
                  module: item.module.identifier,
                  diff: item.diff.map((reason) => ({
                    ...reason,
                    resolvedModule: null,
                    resolvedEntry: null,
                  })),
                  before: item.reference.length,
                  after: item.after.length,
                },
              },
            },
          ],
        },
      );
    }
  }
}

const diffDeprecatedModules: WebpackRule<Params> = (ruleParams, data, api): void => {
  api.setRuleDescriptor({
    description:
      'Compares usage of specified modules between input and reference stats. Fails if usage has increased',
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
      ? { exclude: [], target: ruleParams.map(normalizeModuleTarget) }
      : {
          exclude: ruleParams.exclude.map((item) =>
            normalizeExclude(item, 'compilation'),
          ),
          target: ruleParams.target.map(normalizeModuleTarget),
        }
    : null;

  if (!normalizedRuleParams?.target.length) {
    throw new Error('Deprecated deps is not specified');
  }

  if (!data.files.find((file) => file.name === 'reference.json')) {
    console.warn('[diff-deprecated-modules]: reference-stats is not specified');
    return;
  }

  for (const target of normalizedRuleParams.target) {
    handledModules(target, normalizedRuleParams, data, api);
  }
};

export default diffDeprecatedModules;
