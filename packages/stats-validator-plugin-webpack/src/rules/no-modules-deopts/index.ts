import { Prepared } from '@statoscope/webpack-model';
import {
  NormalizedFile,
  NormalizedCompilation,
  NormalizedModule,
} from '@statoscope/webpack-model/types';
import { API } from '@statoscope/types/types/validation/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { WebpackRule } from '../../';
import { ExcludeItem, normalizeExclude } from '../../limits-helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json');

export type ModuleResultItem = {
  file: NormalizedFile;
  compilation: NormalizedCompilation;
  modules: Array<NormalizedModule>;
};

export type RuleExcludeItem = ExcludeItem<'compilation' | 'module'>;

export type NormalizedParams = {
  exclude: RuleExcludeItem[];
};

export type Params = {
  exclude: Array<string | RegExp | RuleExcludeItem> | NormalizedParams['exclude'];
};

function handled(
  ruleParams: NormalizedParams,
  data: RuleDataInput<Prepared>,
  api: API
): ModuleResultItem[] {
  const query = `
  $input: resolveInputFile();
  $exclude: #.exclude;
  
  $input.group(<compilations>)
    .({file: value.pick(), compilation: key})
    .exclude({
      exclude: $exclude.[type='compilation'].name,
      get: <name>,
    })
    .({
      ...$,
      modules: compilation..modules
      .exclude({
        exclude: $exclude.[type='module'].name,
        get: <name>,
      }).[optimizationBailout]
    }).[modules]
  `;
  const result = data.query(query, data.files, {
    exclude: ruleParams.exclude,
  }) as ModuleResultItem[];

  for (const resultItem of result) {
    for (const module of resultItem.modules) {
      api.message(`Module ${module.name} has deoptimizations`, {
        filename: resultItem.file.name,
        compilation: resultItem.compilation.hash,
        related: [{ type: 'module', id: module.identifier }],
        details: [
          {
            type: 'text',
            content: module.optimizationBailout ?? [],
          },
          {
            type: 'discovery',
            query: `
            $input: resolveInputFile();
            $input.compilations
              .[hash=#.compilation]
              ..modules.[name=#.module]
            `,
            payload: {
              context: {
                module: module.identifier,
                compilation: resultItem.compilation.hash,
              },
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
    description: `Ensures that bundle doesn't have modules with deoptimization`,
    package: {
      author: version.author,
      description: version.description,
      homepage: version.homepage,
      name: version.name,
      version: version.version,
    },
  });

  const normalizedRuleParams: NormalizedParams = {
    exclude: ruleParams?.exclude.map((item) => normalizeExclude(item, 'module')) ?? [],
  };

  handled(normalizedRuleParams, data, api);
};

export default restrictedModules;
