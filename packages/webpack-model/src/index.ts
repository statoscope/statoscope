// @ts-ignore
import jora from 'jora';

import {
  prepareWithJora as prepareWithJoraOriginal,
  Options,
} from '@statoscope/helpers/dist/jora';
import joraHelpers from './jora-helpers';
import normalize, {
  NormalizedCompilation,
  NormalizedFile,
  RawStatsFileDescriptor,
} from './normalize';

export { default as validate } from './validate';
export * as module from './module';

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
  const { files, compilations } = normalize(stats);
  const prepared = prepareWithJoraOriginal(files, {
    helpers: { ...options.helpers, ...joraHelpers(compilations) },
  });

  return {
    files,
    compilations: compilations.map((c) => c.data),
    query: (query: string, data?: unknown, context?: unknown): unknown =>
      prepared.query(query, data, context),
  };
}
