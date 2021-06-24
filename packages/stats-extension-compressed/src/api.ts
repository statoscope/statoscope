import {
  default as makeEntityResolver,
  Resolver,
} from '@statoscope/helpers/dist/entity-resolver';
import { APIFactory } from '@statoscope/extensions';
import {
  CompressedExtensionFormat,
  CompressedExtensionResource,
  Size,
} from './generator';

export type CompressedExtensionAPI = (
  compilationId: string,
  resourceId: string
) => Size | null;

const makeCompressedExtensionAPI: APIFactory<
  CompressedExtensionFormat,
  CompressedExtensionAPI
> = (source) => {
  const sizeResolvers: Map<string, Resolver<string, CompressedExtensionResource>> =
    new Map();

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

export default makeCompressedExtensionAPI;
