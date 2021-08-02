import { Prepared } from '@statoscope/webpack-model';
import { NormalizedReason } from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { WebpackRule } from '../../';
import { ModuleTarget, normalizeModuleTarget, RawTarget } from '../../helpers';
import { ExcludeItem, normalizeExclude } from '../../limits-helpers';

export type ModuleResultItem = {
  moduleName: string;
  after: NormalizedReason[];
  reference: NormalizedReason[];
};

export type RuleExcludeItem = ExcludeItem<'compilation'>;

export type NormalizedParams = {
  target: ModuleTarget[];
  exclude: RuleExcludeItem[];
};
export type Params =
  | RawTarget<ModuleTarget>[]
  | {
      target: RawTarget<ModuleTarget>[];
      exclude: Array<string | RegExp | RuleExcludeItem>;
    };

function handledModules(
  target: ModuleTarget,
  ruleParams: NormalizedParams,
  data: RuleDataInput<Prepared>,
  api: API
): void {
  // todo make diff lazy
  const query = `
  $after: $;
  $reference: #.reference;
  $target: #.target;
  $exclude: #.exclude;

  $after.compilations
  .exclude({
    exclude: $exclude.[type='compilation'].name,
    get: <name>,
  })
  ..modules.[name.isMatch($target.name)]
  .group(<name>)
  .({
    $key;
    $afterReasons: value.reasons;
    $referenceReasons: $reference.compilations
    .exclude({
      exclude: $exclude.[type='compilation'].name,
      get: <name>,
    })
    .(
      $compilation: $;
      $key.resolveModule($compilation.hash)
    ).[].reasons;
    $diff: $afterReasons.[
      $item: $;
      not $referenceReasons.[moduleName=$item.moduleName and userRequest=$item.userRequest and type=$item.type]
    ];
    moduleName: key,
    after: $afterReasons,
    reference: $referenceReasons,
    $diff
  }).[diff]
  `;
  const result = data.input.query(query, data.input.files[0], {
    target,
    reference: data.reference!.files[0],
    exclude: ruleParams.exclude,
  }) as ModuleResultItem[];

  for (const item of result) {
    if (item.after.length > item.reference.length) {
      api.error(
        `Usage of ${item.moduleName} was increased from ${item.reference.length} to ${item.after.length}`,
        {
          filename: data.input.files[0].name,
          related: [{ type: 'module', id: item.moduleName }],
        }
      );
    }
  }
}

const diffDeprecatedModules: WebpackRule<Params> = (ruleParams, data, api): void => {
  const normalizedRuleParams: NormalizedParams | null = ruleParams
    ? Array.isArray(ruleParams)
      ? { exclude: [], target: ruleParams.map(normalizeModuleTarget) }
      : {
          exclude: ruleParams.exclude.map((item) =>
            normalizeExclude(item, 'compilation')
          ),
          target: ruleParams.target.map(normalizeModuleTarget),
        }
    : null;

  if (!normalizedRuleParams?.target.length) {
    throw new Error('Deprecated deps is not specified');
  }

  if (!data.reference) {
    throw new Error('Reference-stats is not specified');
  }

  for (const target of normalizedRuleParams.target) {
    handledModules(target, normalizedRuleParams, data, api);
  }
};

export default diffDeprecatedModules;
