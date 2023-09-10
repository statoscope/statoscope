import { NormalizedCompilation } from '@statoscope/webpack-model/types';
import helpers from '@statoscope/helpers/dist/jora';
import { APIFnOptions } from '@statoscope/types/types/validation/api';
import { WebpackRule } from '../../';
import { ByNameFilterItem, ExcludeItem, normalizeExclude } from '../../limits-helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json');

export type Limits = number;

export type RuleExcludeItem = ExcludeItem<'compilation'>;
export type Params =
  | Limits
  | {
      exclude?: Array<string | RegExp | RuleExcludeItem>;
      global?: Limits;
      byName?: ByNameFilterItem<Limits>[];
    };

export type ResultItem = {
  compilation: NormalizedCompilation;
  rule: Limits;
  buildTime: number;
  buildTimeOK: boolean;
};

const h = helpers();

export type NormalizedParams = Exclude<Params, 'exclude'> & {
  exclude: ExcludeItem<'compilation'>[];
};

const buildTimeLimits: WebpackRule<Params> = (ruleParams, data, api): void => {
  api.setRuleDescriptor({
    description: 'Ensures that the build time has not exceeded the limit',
    package: {
      author: version.author,
      description: version.description,
      homepage: version.homepage,
      name: version.name,
      version: version.version,
    },
  });

  if (typeof ruleParams === 'number') {
    ruleParams = { global: ruleParams };
  }

  if (!ruleParams?.global && !ruleParams?.byName?.length) {
    throw new Error('Build time limits is not specified');
  }

  const normalizedParams: NormalizedParams = {
    ...ruleParams,
    exclude:
      ruleParams.exclude?.map((item) => normalizeExclude(item, 'compilation')) ?? [],
  };

  const query = `
  $input: resolveInputFile();
  $params: #.params;
  
  $input.compilations
  .exclude({
    exclude: $params.exclude.[type='compilation'].name,
    get: <name>,
  })
  .[not time.isNullish()]
  .({
    $compilation: $;
    $matchedRule: $params.byName.[$compilation.name.isMatch(name)].pick(-1).limits;
    $rule: [$matchedRule, $params.global].useNotNullish();
    $buildTime: $compilation.time;
    $compilation,
    $rule,
    $buildTime,
    buildTimeOK: $rule = null ? true : $buildTime <= $rule,
  })
  .[not buildTimeOK]`;

  const result = data.query(query, data.files, {
    params: normalizedParams,
  }) as ResultItem[];

  for (const item of result) {
    const options: APIFnOptions = {
      filename: data.files[0].name,
      compilation: item.compilation.hash,
      related: [{ type: 'compilation', id: item.compilation.hash }],
      details: [
        {
          type: 'discovery',
          query: `
            $input: resolveInputFile();
            {
              entry: #.entry.resolveEntrypoint(#.compilation),
              useCompressedSize: #.useCompressedSize,
              downloadTime: #.downloadTime,
              initialDownloadTime: #.initialDownloadTime,
              asyncDownloadTime: #.asyncDownloadTime,
              rule: #.rule,
            }
            `,
          payload: {
            context: {
              compilation: item.compilation.hash,
              rule: item.rule,
              buildTime: item.buildTime,
              buildTimeOK: item.buildTimeOK,
            },
          },
        },
      ],
    };

    if (!item.buildTimeOK) {
      api.message(
        `Compilation "${
          item.compilation.name ?? item.compilation.hash.slice(0, 7)
        }": Build time is ${h.formatDuration(
          item.buildTime,
        )}. It's over the ${h.formatDuration(item.rule)} limit`,
        options,
      );
    }
  }
};

export default buildTimeLimits;
