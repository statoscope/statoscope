import { APIFactory } from '@statoscope/extensions';
import makeIndex, { IndexAPI } from '@statoscope/helpers/dist/indexer';
import { Format, Resource, Size } from './generator';

export type API = (compilationId: string, resourceId: string) => Size | null;

const makeAPI: APIFactory<Format, API> = (source) => {
  const sizeIndexes: Map<string, IndexAPI<string, Resource>> = new Map();

  for (const compilation of source.payload.compilations) {
    sizeIndexes.set(
      compilation.id,
      makeIndex((r) => r.id, compilation.resources)
    );
  }

  return (compilationId: string, resourceId: string): Size | null => {
    return sizeIndexes.get(compilationId)?.get(resourceId)?.size ?? null;
  };
};

export default makeAPI;
