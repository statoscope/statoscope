import {
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
} from '@statoscope/webpack-model/types';
import helpers from '@statoscope/helpers/dist/jora';
import networkListType from '@statoscope/helpers/dist/network-type-list';
import { APIFnOptions } from '@statoscope/types/types/validation/api';
import { WebpackRule } from '../../';
import { ByNameFilterItem, ExcludeItem, normalizeExclude } from '../../limits-helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json');

type NetworkType = (typeof networkListType)[number]['name'];

export type Limits = {
  maxDownloadTime?: number;
  maxInitialDownloadTime?: number;
  maxAsyncDownloadTime?: number;
};

export type RuleExcludeItem = ExcludeItem<'compilation' | 'entry' | 'asset'>;
export type Params = {
  exclude?: Array<string | RegExp | RuleExcludeItem>;
  useCompressedSize?: boolean;
  network: NetworkType;
  global?: Limits;
  byName?: ByNameFilterItem<Limits>[];
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
  limit: number,
): string {
  return `Entry "${entry.name}": Download time of ${type} is ${h.formatDuration(
    downloadTime,
  )}. It's over the ${h.formatDuration(limit)} limit`;
}

export type NormalizedParams = Exclude<Params, 'exclude' | 'useCompressedSize'> & {
  useCompressedSize: boolean;
  exclude: RuleExcludeItem[];
};

const entryDownloadTimeLimits: WebpackRule<Params> = (ruleParams, data, api): void => {
  api.setRuleDescriptor({
    description:
      'Ensures that the download time of entrypoints has not exceeded the limit',
    package: {
      author: version.author,
      description: version.description,
      homepage: version.homepage,
      name: version.name,
      version: version.version,
    },
  });

  if (!ruleParams?.global && !ruleParams?.byName?.length) {
    throw new Error('Entry download time limits is not specified');
  }

  const normalizedParams: NormalizedParams = {
    ...ruleParams,
    useCompressedSize: ruleParams.useCompressedSize !== false,
    exclude: ruleParams.exclude?.map((item) => normalizeExclude(item, 'entry')) ?? [],
  };

  const query = `
  $input: resolveInputFile();
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

  const result = data.query(query, data.files, {
    params: normalizedParams,
  }) as ResultItem[];

  for (const item of result) {
    for (const entryItem of item.entrypoints) {
      const options: APIFnOptions = {
        filename: data.files[0].name,
        compilation: item.compilation.hash,
        related: [{ type: 'entry', id: entryItem.entry.name }],
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
                entry: entryItem.entry.name,
                compilation: item.compilation.hash,
                useCompressedSize: normalizedParams.useCompressedSize,
                downloadTime: entryItem.downloadTime,
                initialDownloadTime: entryItem.initialDownloadTime,
                asyncDownloadTime: entryItem.asyncDownloadTime,
                rule: entryItem.rule,
              },
            },
          },
        ],
      };

      if (!entryItem.downloadTimeOK) {
        api.message(
          formatError(
            'assets',
            entryItem.entry,
            entryItem.downloadTime,
            entryItem.rule.maxDownloadTime!,
          ),
          options,
        );
      }

      if (!entryItem.initialDownloadTimeOK) {
        api.message(
          formatError(
            'initial assets',
            entryItem.entry,
            entryItem.initialDownloadTime,
            entryItem.rule.maxInitialDownloadTime!,
          ),
          options,
        );
      }

      if (!entryItem.asyncDownloadTimeOK) {
        api.message(
          formatError(
            'async assets',
            entryItem.entry,
            entryItem.asyncDownloadTime,
            entryItem.rule.maxAsyncDownloadTime!,
          ),
          options,
        );
      }
    }
  }
};

export default entryDownloadTimeLimits;
