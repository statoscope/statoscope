import {
  NormalizedChunk,
  NormalizedCompilation,
} from '@statoscope/webpack-model/dist/normalize';
import { APIFnOptions } from '@statoscope/types/types/validation/api';
import helpers, { Limit, ValueDiff } from '@statoscope/helpers/dist/jora';
import { WebpackRule } from '../../';
import {
  ByNameFilterItem,
  ExcludeItem,
  normalizeExclude,
  SerializedExcludeItem,
} from '../../limits-helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json');

export type Limits = number | Limit;

export type NormalizedLimits = Limit | null;

export type RuleExcludeItem = ExcludeItem<'compilation'>;
export type SerializedRuleExcludeItem = SerializedExcludeItem<'compilation'>;

export type Params =
  | number
  | {
      global?: Limits;
      exclude?: Array<string | RegExp | RuleExcludeItem>;
      byName?: ByNameFilterItem<Limits>[];
    };

export type NormalizedParams = {
  global: NormalizedLimits;
  exclude: RuleExcludeItem[];
  byName: ByNameFilterItem<NormalizedLimits>[];
};

export type ResultEntryState = {
  chunks: NormalizedChunk[];
  initialChunks: NormalizedChunk[];
  asyncChunks: NormalizedChunk[];
  downloadTime: number;
  initialDownloadTime: number;
  asyncDownloadTime: number;
};

export type Result = {
  slowestInputCompilation: NormalizedCompilation;
  slowestReferenceCompilation: NormalizedCompilation;
  rule: Limits;
  diff: ValueDiff & { ok: boolean };
};

function normalizeLimit(limit?: number | Limit): Limit | null {
  if (limit == null) {
    return null;
  }

  return typeof limit === 'number' ? { type: 'absolute', number: limit } : limit;
}

function normalizeLimits(limits?: Limits): NormalizedLimits {
  return normalizeLimit(limits);
}

function normalizeParams(params: Params): NormalizedParams {
  if (typeof params === 'number') {
    params = { global: params };
  }

  return {
    global: normalizeLimits(params.global),
    byName:
      params.byName?.map((item) => {
        return { name: item.name, limits: normalizeLimits(item.limits) };
      }) ?? [],
    exclude: params?.exclude?.map((item) => normalizeExclude(item, 'compilation')) ?? [],
  };
}

const h = helpers();

const diffEntryDownloadTimeLimits: WebpackRule<Params> = (
  ruleParams,
  data,
  api
): void => {
  api.setRuleDescriptor({
    description:
      'Compares build time between input and reference stats. Fails if build time has increased',
    package: {
      author: version.author,
      description: version.description,
      homepage: version.homepage,
      name: version.name,
      version: version.version,
    },
  });

  if (!ruleParams) {
    throw new Error('Params is not specified');
  }

  if (!data.files.find((file) => file.name === 'reference.json')) {
    console.warn('[diff-entry-download-time-limits]: reference-stats is not specified');
    return;
  }
  const normalizedParams = normalizeParams(ruleParams);

  const query = `
  $input: resolveInputFile();
  $reference: resolveReferenceFile();
  $params: #.params;
  
  $slowestInputCompilation: $input.compilations
  .exclude({
    exclude: $params.exclude.[type='compilation'].name,
    get: <name>,
  })
  .[time.typeof()='number']
  .reduce(=> time > $$.time ? $ : $$);
  
  $slowestReferenceCompilation: $reference.compilations
  .exclude({
    exclude: $params.exclude.[type='compilation'].name,
    get: <name>,
  })
  .[time.typeof()='number']
  .reduce(=> time > $$.time ? $ : $$);
  
  $matchedRule: $params.byName.[$entry.name.isMatch(name)].pick(-1).limits;
  $rule: [$matchedRule, $params.global, Infinity].useNotNullish();
  
  {
    $slowestInputCompilation,
    $slowestReferenceCompilation,
    $rule,
    diff: {
      $diff: {
        absolute: $slowestInputCompilation.time - $slowestReferenceCompilation.time,
        percent: $slowestInputCompilation.time.percentFrom($slowestReferenceCompilation.time),
      };
      ...$diff,
      ok: $diff.diff_isLTETheLimit($rule)
    }
  }`;
  const result = data.query(query, data.files, {
    params: normalizedParams,
  }) as Result;

  if (!result.diff.ok) {
    const options: APIFnOptions = {
      filename: data.files[0].name,
      compilation: result.slowestInputCompilation.hash,
      related: [{ type: 'compilation', id: result.slowestInputCompilation.hash }],
      details: [
        {
          type: 'discovery',
          query: `
            {
              slowestInputCompilation: #.slowestInputCompilation.resolveStat().compilation,
              slowestReferenceCompilation: #.slowestReferenceCompilation.resolveStat().compilation,
              rule: #.rule,
              diff: #.diff,
            }
            `,
          payload: {
            context: {
              slowestInputCompilation: result.slowestInputCompilation.hash,
              slowestReferenceCompilation: result.slowestReferenceCompilation.hash,
              rule: result.rule,
              diff: result.diff,
            },
          },
        },
      ],
    };

    if (!result.diff.ok) {
      const normalizedLimit: Limit =
        typeof result.rule === 'number'
          ? { type: 'absolute', number: result.rule }
          : result.rule;
      const message = `Entry "${
        result.slowestInputCompilation.name ??
        result.slowestInputCompilation.hash.slice(0, 7)
      }": Build time diff is ${h.formatDuration(
        result.slowestInputCompilation.time!
      )} (${result.diff.percent.toFixed(2)}%). It's over the ${
        normalizedLimit.type === 'absolute'
          ? h.formatDuration(normalizedLimit.number)
          : `${h.toFixed(normalizedLimit.number)}%`
      } limit`;

      api.message(message, options);
    }
  }
};

export default diffEntryDownloadTimeLimits;
