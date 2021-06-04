// @ts-ignore
import jora from 'jora';

import joraHelpers from './jora-helpers';
import normalize, {
  NormalizedCompilation,
  NormalizedFile,
  RawStatsFileDescriptor,
} from './normalize';

export { default as makeEntityResolver } from './entity-resolver';
export { default as validate } from './validate';
export * as module from './module';

export { joraHelpers, normalize };

export type Options = {
  helpers?: Record<string, unknown>;
};

export type Prepared = {
  files: NormalizedFile[];
  compilations: NormalizedCompilation[];
  query: (query: string, data: unknown) => unknown;
};

export function prepareWithJora(
  stats: RawStatsFileDescriptor | RawStatsFileDescriptor[],
  options: Options = {}
): Prepared {
  const { files, compilations } = normalize(stats);
  const j = jora.setup({
    ...options.helpers,
    ...joraHelpers(compilations),
  });
  const context = {};

  return {
    files,
    compilations: compilations.map((c) => c.data),
    query: (query: string, data: unknown): unknown => j(query)(data || files, context),
  };
}
