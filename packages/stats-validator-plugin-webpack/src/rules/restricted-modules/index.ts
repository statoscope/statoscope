import path from 'path';
import { Prepared } from '@statoscope/webpack-model';
import {
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
} from '@statoscope/webpack-model/dist/normalize';
import { API } from '@statoscope/types/types/validation';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { WebpackRule } from '../../';
import {
  ModuleTarget,
  normalizeModuleTarget,
  RawTarget,
  serializeModuleTarget,
} from '../../helpers';
import { ExcludeItem, normalizeExclude, serializeExclude } from '../../limits-helpers';
import * as version from '../../version';

export type ModuleResultItem = {
  file: NormalizedFile;
  compilation: NormalizedCompilation;
  modules: Array<NormalizedModule>;
};

export type RuleExcludeItem = ExcludeItem<'compilation'>;

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
  $input: resolveInputFile();
  $exclude: #.exclude;
  $target: #.target;
  
  $input.group(<compilations>)
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
  const result = data.query(query, data.files, {
    target,
    exclude: ruleParams.exclude,
  }) as ModuleResultItem[];

  for (const resultItem of result) {
    for (const module of resultItem.modules) {
      api.error(`Module ${module.name} should not be used`, {
        filename: resultItem.file.name,
        compilation: resultItem.compilation.name || resultItem.compilation.hash,
        related: [{ type: 'module', id: module.name }],
        details: [
          {
            type: 'discovery',
            query,
            filename: path.basename(resultItem.file.name ?? data.files[0].name),
            serialized: {
              context: {
                target: serializeModuleTarget(target),
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
                  },
                  exclude: $theContext.exclude.(deserializeStringOrRegexp)
                }
              }`,
            },
          },
        ],
      });
    }
  }

  return result;
}

const restrictedModules: WebpackRule<Params> = (ruleParams, data, api): void => {
  api.setRuleDescriptor({
    description: `Ensures that bundle doesn't use specified modules`,
    package: version,
  });

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
