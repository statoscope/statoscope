import {
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
} from '@statoscope/webpack-model/dist/normalize';
import networkListType from '@statoscope/helpers/dist/network-type-list';
import { APIFnOptions } from '@statoscope/types/types/validation/api';
import helpers, { Limit, ValueDiff } from '@statoscope/helpers/dist/jora';
import { WebpackRule } from '../../';
import { ByNameFilterItem, ExcludeItem, normalizeExclude } from '../../limits-helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json');

type NetworkType = typeof networkListType[number]['name'];

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

export type RuleExcludeItem = ExcludeItem<'compilation' | 'entry' | 'asset'>;

export type Params = {
  useCompressedSize?: boolean;
  network?: NetworkType;
  global?: Limits;
  exclude?: Array<string | RegExp | RuleExcludeItem>;
  byName?: ByNameFilterItem<Limits>[];
};

export type NormalizedParams = {
  useCompressedSize: boolean;
  network: NetworkType;
  global: NormalizedLimits;
  exclude: RuleExcludeItem[];
  byName: ByNameFilterItem<NormalizedLimits>[];
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
    network: params.network ?? 'Slow',
    byName:
      params.byName?.map((item) => {
        return { name: item.name, limits: normalizeLimits(item.limits) };
      }) ?? [],
    exclude: params?.exclude?.map((item) => normalizeExclude(item, 'entry')) ?? [],
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
  api.setRuleDescriptor({
    description:
      'Compares download time of entrypoints between input and reference stats. Fails if download time has increased',
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
  $useCompressedSize: [$params.useCompressedSize, true].useNotNullish();
  $network: [$params.network, 'Slow'].useNotNullish();
  $getSizeByChunks: => files.exclude({
    exclude: $params.exclude.[type='asset'].name,
    get: <name>,
  }).(getAssetSize($$, $useCompressedSize!=false)).reduce(=> size + $$, 0);
  
  $input.compilations
  .exclude({
    exclude: $params.exclude.[type='compilation'].name,
    get: <name>,
  })
  .({
    $compilation: $;
    $referenceCompilation: $reference.compilations
    .exclude({
      exclude: $params.exclude.[type='compilation'].name,
      get: <name>,
    })
    .[name=$compilation.name].pick();
    $compilation,
    $referenceCompilation,
    entrypoints: entrypoints
    .({
      $entry: $;
      $referenceEntry: $referenceCompilation.entrypoints.[name=$entry.name].pick();
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
        $downloadTime: $chunks.$getSizeByChunks($$).getDownloadTime($network);
        $initialDownloadTime: $initialChunks.$getSizeByChunks($$).getDownloadTime($network);
        $asyncDownloadTime: $asyncChunks.$getSizeByChunks($$).getDownloadTime($network);
        
        entry: $,
        $chunks,
        $initialChunks,
        $asyncChunks,
        $downloadTime,
        $initialDownloadTime,
        $asyncDownloadTime,
      };
      $reference: referenceEntry.$handleEntry($referenceCompilation.hash);
      $after: afterEntry.$handleEntry($compilation.hash);
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
  const result = data.query(query, data.files, {
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
            query: `
            $input: resolveInputFile();
            {
              entry: #.entry.resolveEntrypoint(#.compilation),
              useCompressedSize: #.useCompressedSize,
              before: #.before,
              after: #.after,
              diff: #.diff,
              rule: #.rule,
            }
            `,
            payload: {
              context: {
                entry: entryItem.after.entry.name,
                compilation: item.compilation.hash,
                useCompressedSize: normalizedParams.useCompressedSize,
                before: {
                  downloadTime: entryItem.reference.downloadTime,
                  initialDownloadTime: entryItem.reference.initialDownloadTime,
                  asyncDownloadTime: entryItem.reference.asyncDownloadTime,
                },
                after: {
                  downloadTime: entryItem.after.downloadTime,
                  initialDownloadTime: entryItem.after.initialDownloadTime,
                  asyncDownloadTime: entryItem.after.asyncDownloadTime,
                },
                diff: entryItem.diff,
                rule: entryItem.rule,
              },
            },
          },
        ],
      };

      if (!entryItem.diff.downloadTime.ok) {
        api.message(
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
        api.message(
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
        api.message(
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
