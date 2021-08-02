import {
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
} from '@statoscope/webpack-model/dist/normalize';
import { APIFnOptions } from '@statoscope/stats-validator/dist/api';
import helpers from '@statoscope/helpers/dist/jora';
import networkListType from '@statoscope/helpers/dist/network-type-list';
import { WebpackRule } from '../../';
import { ByNameFilterItem, ExcludeItem, normalizeExclude } from '../../limits-helpers';

type NetworkType = typeof networkListType[number]['name'];

export type Limits = {
  maxDownloadTime?: number;
  maxInitialDownloadTime?: number;
  maxAsyncDownloadTime?: number;
};

export type RuleExcludeItem = ExcludeItem<'compilation' | 'entry'>;
export type Params = {
  exclude?: Array<string | RegExp | RuleExcludeItem>;
  useCompressedSize?: boolean;
  network: NetworkType;
  global?: Limits;
  byName?: Array<ByNameFilterItem<Limits>>;
};

export type ResultItem = {
  compilation: NormalizedCompilation;
  entrypoints: Array<{
    entry: NormalizedEntrypointItem;
    chunks: NormalizedChunk[];
    initialChunks: NormalizedChunk[];
    asyncChunks: NormalizedChunk[];
    rule: Limits;
    downloadTime: number;
    initialDownloadTime: number;
    asyncDownloadTime: number;
    downloadTimeOK: boolean;
    initialDownloadTimeOK: boolean;
    asyncDownloadTimeOK: boolean;
  }>;
};

const h = helpers();

function formatError(
  type: 'assets' | 'initial assets' | 'async assets',
  entry: NormalizedEntrypointItem,
  downloadTime: number,
  limit: number
): string {
  return `Entry "${entry.name}": Download time of ${type} is ${h.formatDuration(
    downloadTime
  )}. It's over the ${h.formatDuration(limit)} limit`;
}

const entryDownloadTimeLimits: WebpackRule<Params> = (ruleParams, data, api): void => {
  if (!ruleParams?.global && !ruleParams?.byName?.length) {
    throw new Error('Entry download time limits is not specified');
  }

  const query = `
  $params: #.params;
  $useCompressedSize: [$params.useCompressedSize, true].useNotNullish();
  $network: [$params.network, 'Slow'].useNotNullish();
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
        maxDownloadTime: [$matchedRule.maxDownloadTime, $params.global.maxDownloadTime].useNotNullish(),
        maxInitialDownloadTime: [$matchedRule.maxInitialDownloadTime, $params.global.maxInitialDownloadTime].useNotNullish(),
        maxAsyncDownloadTime: [$matchedRule.maxAsyncDownloadTime, $params.global.maxAsyncDownloadTime].useNotNullish(),
      };
      $chunks: ($entry.data.chunks + $entry.data.chunks..children);
      $initialChunks: $chunks.[initial];
      $asyncChunks: $chunks.[not initial];
      $downloadTime: $chunks.$getSizeByChunks($compilation.hash).getDownloadTime($network);
      $initialDownloadTime: $initialChunks.$getSizeByChunks($compilation.hash).getDownloadTime($network);
      $asyncDownloadTime: $asyncChunks.$getSizeByChunks($compilation.hash).getDownloadTime($network);
      
      $entry,
      $chunks,
      $initialChunks,
      $asyncChunks,
      $rule,
      $downloadTime,
      $initialDownloadTime,
      $asyncDownloadTime,
      downloadTimeOK: $rule.maxDownloadTime = null ? true : $downloadTime <= $rule.maxDownloadTime,
      initialDownloadTimeOK: $rule.maxInitialDownloadTime = null ? true : $initialDownloadTime <= $rule.maxInitialDownloadTime,
      asyncDownloadTimeOK: $rule.maxAsyncDownloadTime = null ? true : $asyncDownloadTime <= $rule.maxAsyncDownloadTime,
    })
    .[not (downloadTimeOK and initialDownloadTimeOK and asyncDownloadTimeOK)]
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

      if (!entryItem.downloadTimeOK) {
        api.error(
          formatError(
            'assets',
            entryItem.entry,
            entryItem.downloadTime,
            entryItem.rule.maxDownloadTime!
          ),
          options
        );
      }

      if (!entryItem.initialDownloadTimeOK) {
        api.error(
          formatError(
            'initial assets',
            entryItem.entry,
            entryItem.initialDownloadTime,
            entryItem.rule.maxInitialDownloadTime!
          ),
          options
        );
      }

      if (!entryItem.asyncDownloadTimeOK) {
        api.error(
          formatError(
            'async assets',
            entryItem.entry,
            entryItem.asyncDownloadTime,
            entryItem.rule.maxAsyncDownloadTime!
          ),
          options
        );
      }
    }
  }
};

export default entryDownloadTimeLimits;
