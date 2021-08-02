import { Prepared } from '@statoscope/webpack-model';
import {
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
} from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { WebpackRule } from '../../';
import { ModuleTarget, normalizeModuleTarget, RawTarget } from '../../helpers';
import { RuleExcludeItem } from '../diff-deprecated-modules';
import { normalizeExclude } from '../../limits-helpers';

export type ModuleResultItem = {
  file: NormalizedFile;
  compilation: NormalizedCompilation;
  modules: Array<NormalizedModule>;
};

export type NormalizedParams = {
  target: ModuleTarget[];
  exclude: RuleExcludeItem[];
};

export type Params =
  | RawTarget<ModuleTarget>[]
  | {
      target: RawTarget<ModuleTarget>[] | NormalizedParams['target'];
      exclude: Array<string | RegExp | RuleExcludeItem> | NormalizedParams['exclude'];
    };

function handledTarget(
  target: ModuleTarget,
  ruleParams: NormalizedParams,
  data: RuleDataInput<Prepared>,
  api: API
): ModuleResultItem[] {
  const query = `
  $exclude: #.exclude;
  $target: #.target;
  
  .group(<compilations>)
    .({file: value.pick(), compilation: key})
    .exclude({
      exclude: $exclude.[type='compilation'].name,
      get: <name>,
    })
    .({
      ...$,
      modules: compilation..modules.[name.isMatch($target.name)]
    }).[modules]
  `;
  const result = data.input.query(query, data.input.files, {
    target,
    exclude: ruleParams.exclude,
  }) as ModuleResultItem[];

  for (const resultItem of result) {
    for (const module of resultItem.modules) {
      api.error(`${module.name} should not be used`, {
        filename: resultItem.file.name,
        compilation: resultItem.compilation.name || resultItem.compilation.hash,
        related: [{ type: 'module', id: module.name }],
      });
    }
  }

  return result;
}

const restrictedModules: WebpackRule<Params> = (ruleParams, data, api): void => {
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
    throw new Error('Restricted modules is not specified');
  }

  for (const target of normalizedRuleParams.target) {
    handledTarget(target, normalizedRuleParams, data, api);
  }
};

export default restrictedModules;
