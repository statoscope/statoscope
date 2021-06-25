import {
  default as makeEntityResolver,
  Resolver,
} from '@statoscope/helpers/dist/entity-resolver';
import { APIFactory } from '@statoscope/extensions';
import { Format, Resource, Size } from './generator';

export type API = (compilationId: string, resourceId: string) => Size | null;

const makeAPI: APIFactory<Format, API> = (source) => {
  const sizeResolvers: Map<string, Resolver<string, Resource>> = new Map();

  for (const compilation of source.payload.compilations) {
    sizeResolvers.set(
      compilation.id,
      makeEntityResolver(compilation.resources, (r) => r.id)
    );
  }

  return (compilationId: string, resourceId: string): Size | null => {
    return sizeResolvers.get(compilationId)?.(resourceId)?.size ?? null;
  };
};

export default makeAPI;
