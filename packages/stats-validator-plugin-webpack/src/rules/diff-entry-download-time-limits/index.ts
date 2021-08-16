import path from 'path';
import {
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
} from '@statoscope/webpack-model/dist/normalize';
import { APIFnOptions } from '@statoscope/types/types/validation';
import helpers, { Limit, ValueDiff } from '@statoscope/helpers/dist/jora';
import { WebpackRule } from '../../';
import {
  ByNameFilterItem,
  ExcludeItem,
  normalizeExclude,
  SerializedByNameFilterItem,
  SerializedExcludeItem,
  serializeExclude,
} from '../../limits-helpers';

export type Limits = {
  maxDownloadTimeDiff?: number | Limit;
  maxInitialDownloadTimeDiff?: number | Limit;
  maxAsyncDownloadTimeDiff?: number | Limit;
};

export type NormalizedLimits = {
  maxDownloadTimeDiff: Limit | null;
  maxInitialDownloadTimeDiff: Limit | null;
  maxAsyncDownloadTimeDiff: Limit | null;
};

export type RuleExcludeItem = ExcludeItem<'compilation' | 'entry'>;
export type SerializedRuleExcludeItem = SerializedExcludeItem<'compilation' | 'entry'>;

export type Params = {
  useCompressedSize?: boolean;
  global?: Limits;
  exclude?: Array<string | RegExp | RuleExcludeItem>;
  byName?: ByNameFilterItem<Limits>[];
};

export type NormalizedParams = {
  useCompressedSize: boolean;
  global: NormalizedLimits;
  exclude: RuleExcludeItem[];
  byName: ByNameFilterItem<NormalizedLimits>[];
};

export type SerializedParams = {
  useCompressedSize: boolean;
  global: NormalizedLimits;
  exclude: SerializedRuleExcludeItem[];
  byName: SerializedByNameFilterItem<NormalizedLimits>[];
};

export type ResultEntryState = {
  entry: NormalizedEntrypointItem;
  chunks: NormalizedChunk[];
  initialChunks: NormalizedChunk[];
  asyncChunks: NormalizedChunk[];
  downloadTime: number;
  initialDownloadTime: number;
  asyncDownloadTime: number;
};

export type ResultEntryItem = {
  rule: Limits;
  reference: ResultEntryState;
  after: ResultEntryState;
  diff: {
    downloadTime: ValueDiff & { ok: boolean };
    initialDownloadTime: ValueDiff & { ok: boolean };
    asyncDownloadTime: ValueDiff & { ok: boolean };
  };
};

export type ResultItem = {
  compilation: NormalizedCompilation;
  entrypoints: Array<ResultEntryItem>;
};

function normalizeLimit(limit?: number | Limit): Limit | null {
  if (limit == null) {
    return null;
  }

  return typeof limit === 'number' ? { type: 'absolute', number: limit } : limit;
}

function normalizeLimits(limits?: Limits): NormalizedLimits {
  return {
    maxDownloadTimeDiff: normalizeLimit(limits?.maxDownloadTimeDiff),
    maxInitialDownloadTimeDiff: normalizeLimit(limits?.maxInitialDownloadTimeDiff),
    maxAsyncDownloadTimeDiff: normalizeLimit(limits?.maxAsyncDownloadTimeDiff),
  };
}

function normalizeParams(params: Params): NormalizedParams {
  return {
    useCompressedSize: params.useCompressedSize ?? true,
    global: normalizeLimits(params.global),
    byName:
      params.byName?.map((item) => {
        return { name: item.name, limits: normalizeLimits(item.limits) };
      }) ?? [],
    exclude: params?.exclude?.map((item) => normalizeExclude(item, 'entry')) ?? [],
  };
}

function serializeParams(params: NormalizedParams): SerializedParams {
  return {
    useCompressedSize: params.useCompressedSize,
    global: params.global,
    byName:
      params.byName?.map((item) => {
        return {
          name: h.serializeStringOrRegexp(item.name)!,
          limits: item.limits,
        };
      }) ?? [],
    exclude: params.exclude.map(serializeExclude),
  };
}

const h = helpers();

function formatError(
  type: 'assets' | 'initial assets' | 'async assets',
  entry: NormalizedEntrypointItem,
  limit: number | Limit,
  diff: ValueDiff
): string {
  const normalizedLimit: Limit =
    typeof limit === 'number' ? { type: 'absolute', number: limit } : limit;
  return `Entry "${entry.name}": Download time diff of ${type} is ${h.formatDuration(
    diff.absolute
  )} (${diff.percent.toFixed(2)}%). It's over the ${
    normalizedLimit.type === 'absolute'
      ? h.formatDuration(normalizedLimit.number)
      : `${h.toFixed(normalizedLimit.number)}%`
  } limit`;
}

const diffEntryDownloadTimeLimits: WebpackRule<Params> = (
  ruleParams,
  data,
  api
): void => {
  if (!ruleParams) {
    throw new Error('Params is not specified');
  }

  if (!data.files.find((file) => file.name === 'reference.json')) {
    throw new Error('Reference-stats is not specified');
  }

  const normalizedParams = normalizeParams(ruleParams);

  const query = `
  $input: resolveInputFile();
  $reference: resolveReferenceFile();
  $params: #.params;
  $useCompressedSize: [$params.useCompressedSize, true].useNotNullish();
  $network: [$params.network, 'Slow'].useNotNullish();
  $getSizeByChunks: => files.(getAssetSize($$, $useCompressedSize!=false)).reduce(=> size + $$, 0);
  
  $input.compilations
  .exclude({
    exclude: $params.exclude.[type='compilation'].name,
    get: <name>,
  })
  .({
    $compilation: $;
    $compilation,
    entrypoints: entrypoints
    .({
      $entry: $;
      $referenceEntry: $reference.compilations
      .exclude({
        exclude: $params.exclude.[type='compilation'].name,
        get: <name>,
      })
      .entrypoints.[name=$entry.name].pick();
      $entry,
      $referenceEntry
    })
    .[entry and referenceEntry]
    .exclude({
      exclude: $params.exclude.[type='entry'].name,
      get: <entry.name>,
    })
    .({
      $entry;
      $referenceEntry;
      $matchedRule: $params.byName.[$entry.name.isMatch(name)].pick(-1).limits;
      $rule: {
        maxDownloadTimeDiff: [$matchedRule.maxDownloadTimeDiff, $params.global.maxDownloadTimeDiff, Infinity].useNotNullish(),
        maxInitialDownloadTimeDiff: [$matchedRule.maxInitialDownloadTimeDiff, $params.global.maxInitialDownloadTimeDiff, Infinity].useNotNullish(),
        maxAsyncDownloadTimeDiff: [$matchedRule.maxAsyncDownloadTimeDiff, $params.global.maxAsyncDownloadTimeDiff, Infinity].useNotNullish(),
      };
      
      $referenceEntry,
      afterEntry: $entry,
      $rule
    })
    .({
      $rule;
      $handleEntry: => {
        $chunks: data.chunks + data.chunks..children;
        $initialChunks: $chunks.[initial];
        $asyncChunks: $chunks.[not initial];
        $downloadTime: $chunks.$getSizeByChunks($compilation.hash).getDownloadTime($network);
        $initialDownloadTime: $initialChunks.$getSizeByChunks($compilation.hash).getDownloadTime($network);
        $asyncDownloadTime: $asyncChunks.$getSizeByChunks($compilation.hash).getDownloadTime($network);
        
        entry: $,
        $chunks,
        $initialChunks,
        $asyncChunks,
        $downloadTime,
        $initialDownloadTime,
        $asyncDownloadTime,
      };
      $reference: referenceEntry.$handleEntry();
      $after: afterEntry.$handleEntry();
      $rule,
      $reference,
      $after,
      diff: {
        downloadTime: {
          $diff: {
            absolute: $after.downloadTime - $reference.downloadTime,
            percent: $after.downloadTime.percentFrom($reference.downloadTime),
          };
          ...$diff,
          ok: $diff.diff_isLTETheLimit($rule.maxDownloadTimeDiff)
        },
        initialDownloadTime: {
          $diff: {
            absolute: $after.initialDownloadTime - $reference.initialDownloadTime,
            percent: $after.initialDownloadTime.percentFrom($reference.initialDownloadTime)
          };
          ...$diff,
          ok: $diff.diff_isLTETheLimit($rule.maxInitialDownloadTimeDiff)
        },
        asyncDownloadTime: {
          $diff: {
            absolute: $after.asyncDownloadTime - $reference.asyncDownloadTime,
            percent: $after.asyncDownloadTime.percentFrom($reference.asyncDownloadTime)
          };
          ...$diff,
          ok: $diff.diff_isLTETheLimit($rule.maxAsyncDownloadTimeDiff)
        }
      }
    })
    .[
      not diff.downloadTime.ok or
      not diff.initialDownloadTime.ok or
      not diff.asyncDownloadTime.ok
    ]
  })
  .[entrypoints]`;
  const result = data.query(query, data.files[0], {
    params: normalizedParams,
  }) as ResultItem[];

  for (const item of result) {
    for (const entryItem of item.entrypoints) {
      const options: APIFnOptions = {
        filename: data.files[0].name,
        compilation: item.compilation.hash,
        related: [{ type: 'entry', id: entryItem.after.entry.name }],
        details: [
          {
            type: 'discovery',
            query,
            filename: path.basename(data.files[0].name),
            serialized: {
              context: {
                params: serializeParams(normalizedParams),
              },
            },
            deserialize: {
              type: 'query',
              content: `
              $theContext: context;
              {
                context: {
                  params: {
                    exclude: $theContext.params.exclude.(deserializeExclude()),
                    byName: $theContext.params.byName.({ name: name.deserializeStringOrRegexp(), limits }),
                    global: $theContext.params.global,
                    useCompressedSize: $theContext.params.useCompressedSize,
                  },
                }
              }`,
            },
          },
        ],
      };

      if (!entryItem.diff.downloadTime.ok) {
        api.error(
          formatError(
            'assets',
            entryItem.after.entry,
            entryItem.rule.maxDownloadTimeDiff!,
            entryItem.diff.downloadTime
          ),
          options
        );
      }

      if (!entryItem.diff.initialDownloadTime.ok) {
        api.error(
          formatError(
            'initial assets',
            entryItem.after.entry,
            entryItem.rule.maxInitialDownloadTimeDiff!,
            entryItem.diff.initialDownloadTime
          ),
          options
        );
      }

      if (!entryItem.diff.asyncDownloadTime.ok) {
        api.error(
          formatError(
            'async assets',
            entryItem.after.entry,
            entryItem.rule.maxAsyncDownloadTimeDiff!,
            entryItem.diff.asyncDownloadTime
          ),
          options
        );
      }
    }
  }
};

export default diffEntryDownloadTimeLimits;
