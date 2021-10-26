import {
  prepareWithJora as prepareWithJoraOriginal,
  Options,
} from '@statoscope/helpers/dist/jora';
import { NormalizedCompilation, NormalizedFile, RawStatsFileDescriptor } from '../types';
import joraHelpers from './jora-helpers';
import normalize from './handleFile';

export { default as validate } from './validate';
export * as module from './module';

export { StatsExtensionWebpackAdapter } from './stats-extension-webpack-adapter';

export { joraHelpers, normalize };

export type Prepared = {
  files: NormalizedFile[];
  compilations: NormalizedCompilation[];
  query: (query: string, data?: unknown, context?: unknown) => unknown;
};

export function prepareWithJora(
  stats: RawStatsFileDescriptor | RawStatsFileDescriptor[],
  options: Options = {}
): Prepared {
  const normalizeResult = normalize(stats);
  const { files, compilations } = normalizeResult;
  const prepared = prepareWithJoraOriginal(files, {
    helpers: { ...joraHelpers(normalizeResult), ...options.helpers },
  });

  return {
    files,
    compilations: compilations.map((c) => c.data),
    query: (query: string, data?: unknown, context?: unknown): unknown =>
      prepared.query(query, data, context),
  };
}
