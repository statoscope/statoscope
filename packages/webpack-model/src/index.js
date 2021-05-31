import jora from 'jora';

import joraHelpers from './jora-helpers';
import normalize from './normalize';

export { default as makeEntityResolver } from './entity-resolver';
export { default as validate } from './validate';
export * as module from './module';

export { joraHelpers, normalize };

export function prepareWithJora(stats, options = {}) {
  const { files, compilations } = normalize(stats);
  const j = jora.setup({
    ...options.helpers,
    ...joraHelpers(compilations),
  });
  const context = {};

  return {
    files,
    compilations,
    query: (query, data) => j(query)(data || files, context),
  };
}
