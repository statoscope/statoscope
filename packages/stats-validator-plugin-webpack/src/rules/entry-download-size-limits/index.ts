import {
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
} from '@statoscope/webpack-model/dist/normalize';
import { APIFnOptions } from '@statoscope/stats-validator/dist/api';
import helpers from '@statoscope/helpers/dist/jora';
import { WebpackRule } from '../../';
import { ByNameFilterItem, ExcludeItem, normalizeExclude } from '../../limits-helpers';

export type Limits = {
  maxSize?: number;
  maxInitialSize?: number;
  maxAsyncSize?: number;
};

export type RuleExcludeItem = ExcludeItem<'compilation' | 'entry'>;

export type Params = {
  exclude?: Array<string | RegExp | RuleExcludeItem>;
  useCompressedSize?: boolean;
  global?: Limits;
  byName?: Array<ByNameFilterItem<Limits>>;
};

export type ResultEntryItem = {
  entry: NormalizedEntrypointItem;
  chunks: NormalizedChunk[];
  initialChunks: NormalizedChunk[];
  asyncChunks: NormalizedChunk[];
  rule: Limits;
  size: number;
  initialSize: number;
  asyncSize: number;
  sizeOK: boolean;
  initialSizeOK: boolean;
  asyncSizeOK: boolean;
};

export type ResultItem = {
  compilation: NormalizedCompilation;
  entrypoints: Array<ResultEntryItem>;
};

const h = helpers();

function formatError(
  type: 'assets' | 'initial assets' | 'async assets',
  entry: NormalizedEntrypointItem,
  size: number,
  limit: number
): string {
  return `Entry "${entry.name}": Download size of ${type} is ${h.formatSize(
    size
  )}. It's over the ${h.formatSize(limit)} limit`;
}

const entryDownloadSizeLimits: WebpackRule<Params> = (ruleParams, data, api): void => {
  if (!ruleParams?.global && !ruleParams?.byName?.length) {
    throw new Error('Entry size limits is not specified');
  }

  const query = `
  $params: #.params;
  $useCompressedSize: [$params.useCompressedSize, true].useNotNullish();
  $getSizeByChunks: => files.(getAssetSize($$, $useCompressedSize!=false)).reduce(=> size + $$, 0);
  compilations
  .exclude({
    exclude: $params.exclude.[type='compilation'].name,
    get: <name>,
  })
  .({
    $compilation: $;
    $compilation,
    entrypoints: entrypoints
    .exclude({
      exclude: $params.exclude.[type='entry'].name,
      get: <name>,
    })
    .({
      $entry: $;
      $matchedRule: $params.byName.[$entry.name.isMatch(name)].pick(-1).limits;
      $rule: {
        maxSize: [$matchedRule.maxSize, $params.global.maxSize].useNotNullish(),
        maxInitialSize: [$matchedRule.maxInitialSize, $params.global.maxInitialSize].useNotNullish(),
        maxAsyncSize: [$matchedRule.maxAsyncSize, $params.global.maxAsyncSize].useNotNullish(),
      };
      $chunks: ($entry.data.chunks + $entry.data.chunks..children);
      $initialChunks: $chunks.[initial];
      $asyncChunks: $chunks.[not initial];
      $size: $chunks.$getSizeByChunks($compilation.hash);
      $initialSize: $initialChunks.$getSizeByChunks($compilation.hash);
      $asyncSize: $asyncChunks.$getSizeByChunks($compilation.hash);
      
      $entry,
      $chunks,
      $initialChunks,
      $asyncChunks,
      $rule,
      $size,
      $initialSize,
      $asyncSize,
      sizeOK: $rule.maxSize = null ? true : $size <= $rule.maxSize,
      initialSizeOK: $rule.maxInitialSize = null ? true : $initialSize <= $rule.maxInitialSize,
      asyncSizeOK: $rule.maxAsyncSize = null ? true : $asyncSize <= $rule.maxAsyncSize,
    })
    .[not (sizeOK and initialSizeOK and asyncSizeOK)]
  })
  .[entrypoints]`;

  const result = data.input.query(query, data.input, {
    params: {
      ...ruleParams,
      exclude: ruleParams.exclude?.map((item) => normalizeExclude(item, 'entry')) ?? [],
    },
  }) as ResultItem[];

  for (const item of result) {
    for (const entryItem of item.entrypoints) {
      const options: APIFnOptions = {
        filename: data.input.files[0].name,
        compilation: item.compilation.hash,
        related: [{ type: 'entry', id: entryItem.entry.name }],
      };

      if (!entryItem.sizeOK) {
        api.error(
          formatError('assets', entryItem.entry, entryItem.size, entryItem.rule.maxSize!),
          options
        );
      }

      if (!entryItem.initialSizeOK) {
        api.error(
          formatError(
            'initial assets',
            entryItem.entry,
            entryItem.initialSize,
            entryItem.rule.maxInitialSize!
          ),
          options
        );
      }

      if (!entryItem.asyncSizeOK) {
        api.error(
          formatError(
            'async assets',
            entryItem.entry,
            entryItem.asyncSize,
            entryItem.rule.maxAsyncSize!
          ),
          options
        );
      }
    }
  }
};

export default entryDownloadSizeLimits;
