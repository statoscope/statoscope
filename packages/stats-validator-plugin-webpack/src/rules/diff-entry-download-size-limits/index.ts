import path from 'path';
import {
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
} from '@statoscope/webpack-model/dist/normalize';
import helpers, { Limit, ValueDiff } from '@statoscope/helpers/dist/jora';
import { APIFnOptions } from '@statoscope/types/types/validation';
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
  maxSizeDiff?: number | Limit;
  maxInitialSizeDiff?: number | Limit;
  maxAsyncSizeDiff?: number | Limit;
};

export type RuleExcludeItem = ExcludeItem<'compilation' | 'entry'>;

export type Params = {
  exclude?: Array<string | RegExp | RuleExcludeItem>;
  useCompressedSize?: boolean;
  global?: Limits;
  byName?: ByNameFilterItem<Limits>[];
};

export type NormalizedParams = {
  exclude: RuleExcludeItem[];
  useCompressedSize?: boolean;
  global?: Limits;
  byName?: ByNameFilterItem<Limits>[];
};

export type SerializedParams = {
  byName: SerializedByNameFilterItem<Limits>[];
  exclude: SerializedExcludeItem<'compilation' | 'entry'>[];
  useCompressedSize?: boolean;
  global?: Limits;
};

export type ResultEntryState = {
  entry: NormalizedEntrypointItem;
  chunks: NormalizedChunk[];
  initialChunks: NormalizedChunk[];
  asyncChunks: NormalizedChunk[];
  size: number;
  initialSize: number;
  asyncSize: number;
};

export type ResultEntryItem = {
  rule: Limits;
  reference: ResultEntryState;
  after: ResultEntryState;
  diff: {
    size: ValueDiff & { ok: boolean };
    initialSize: ValueDiff & { ok: boolean };
    asyncSize: ValueDiff & { ok: boolean };
  };
};

export type ResultItem = {
  compilation: NormalizedCompilation;
  entrypoints: Array<ResultEntryItem>;
};

const h = helpers();

function serializeParams(params: NormalizedParams): SerializedParams {
  return {
    global: params.global,
    useCompressedSize: params.useCompressedSize,
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

function formatError(
  type: 'assets' | 'initial assets' | 'async assets',
  entry: NormalizedEntrypointItem,
  limit: number | Limit,
  diff: ValueDiff
): string {
  const normalizedLimit: Limit =
    typeof limit === 'number' ? { type: 'absolute', number: limit } : limit;
  return `Entry "${entry.name}": Download size diff of ${type} is ${h.formatSize(
    diff.absolute
  )} (${diff.percent.toFixed(2)}%). It's over the ${
    normalizedLimit.type === 'absolute'
      ? h.formatSize(normalizedLimit.number)
      : `${h.toFixed(normalizedLimit.number)}%`
  } limit`;
}

const diffEntryDownloadSizeLimits: WebpackRule<Params> = (
  ruleParams,
  data,
  api
): void => {
  if (!data.files.find((file) => file.name === 'reference.json')) {
    throw new Error('Reference-stats is not specified');
  }

  const normalizedParams: NormalizedParams = {
    ...ruleParams,
    exclude: ruleParams?.exclude?.map((item) => normalizeExclude(item, 'entry')) ?? [],
  };

  const query = `
  $input: resolveInputFile();
  $reference: resolveReferenceFile();
  $params: #.params;
  $useCompressedSize: [$params.useCompressedSize, true].useNotNullish();
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
        maxSizeDiff: [$matchedRule.maxSizeDiff, $params.global.maxSizeDiff, Infinity].useNotNullish(),
        maxInitialSizeDiff: [$matchedRule.maxInitialSizeDiff, $params.global.maxInitialSizeDiff, Infinity].useNotNullish(),
        maxAsyncSizeDiff: [$matchedRule.maxAsyncSizeDiff, $params.global.maxAsyncSizeDiff, Infinity].useNotNullish(),
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
        $size: $chunks.$getSizeByChunks($compilation.hash);
        $initialSize: $initialChunks.$getSizeByChunks($compilation.hash);
        $asyncSize: $asyncChunks.$getSizeByChunks($compilation.hash);
        
        entry: $,
        $chunks,
        $initialChunks,
        $asyncChunks,
        $size,
        $initialSize,
        $asyncSize,
      };
      $reference: referenceEntry.$handleEntry();
      $after: afterEntry.$handleEntry();
      $rule,
      $reference,
      $after,
      diff: {
        size: {
          $diff: {
            absolute: $after.size - $reference.size,
            percent: $after.size.percentFrom($reference.size)
          };
          ...$diff,
          ok: $diff.diff_isLTETheLimit($rule.maxSizeDiff)
        },
        initialSize: {
          $diff: {
            absolute: $after.initialSize - $reference.initialSize,
            percent: $after.initialSize.percentFrom($reference.initialSize)
          };
          ...$diff,
          ok: $diff.diff_isLTETheLimit($rule.maxInitialSizeDiff)
        },
        asyncSize: {
          $diff: {
            absolute: $after.asyncSize - $reference.asyncSize,
            percent: $after.asyncSize.percentFrom($reference.asyncSize)
          };
          ...$diff,
          ok: $diff.diff_isLTETheLimit($rule.maxAsyncSizeDiff)
        }
      }
    })
    .[
      not diff.size.ok or
      not diff.initialSize.ok or
      not diff.asyncSize.ok
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

      if (!entryItem.diff.size.ok) {
        api.error(
          formatError(
            'assets',
            entryItem.after.entry,
            entryItem.rule.maxSizeDiff!,
            entryItem.diff.size
          ),
          options
        );
      }

      if (!entryItem.diff.initialSize.ok) {
        api.error(
          formatError(
            'initial assets',
            entryItem.after.entry,
            entryItem.rule.maxInitialSizeDiff!,
            entryItem.diff.initialSize
          ),
          options
        );
      }

      if (!entryItem.diff.asyncSize.ok) {
        api.error(
          formatError(
            'async assets',
            entryItem.after.entry,
            entryItem.rule.maxAsyncSizeDiff!,
            entryItem.diff.asyncSize
          ),
          options
        );
      }
    }
  }
};

export default diffEntryDownloadSizeLimits;
