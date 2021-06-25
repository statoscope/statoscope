import { Extension, ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import makeResolver, { Resolver } from '@statoscope/helpers/dist/entity-resolver';
import gzipSize from 'gzip-size';
import { name, version, author, homepage } from './version';

export type Compressor = string | { name: string; version: string };
export type Size = {
  compressor?: Compressor;
  size: number;
};
export type CompressFunction = (source: Buffer | string, filename: string) => Size;

export type Format = Extension<Payload>;
export type Resource = { id: string; size: Size };
export type Compilation = {
  id: string;
  resources: Array<Resource>;
};
export type Payload = {
  compilations: Array<Compilation>;
};

const compressorByType: Record<string, CompressFunction> = {
  gzip(source: Buffer | string): Size {
    return { compressor: 'gzip', size: gzipSize.sync(source) };
  },
};

export type CompressorOrPreset = string | CompressFunction;

export default class Generator {
  private sizeResolvers: Map<Compilation, Resolver<string, Resource>> = new Map();
  private descriptor: ExtensionDescriptor = {
    name,
    version,
    author,
    homepage,
    adapter: this.adapter,
  };
  private payload: Payload = { compilations: [] };
  private resolveCompilation = makeResolver(this.payload.compilations, (item) => item.id);

  constructor(private adapter?: ExtensionDescriptor) {}

  handleResource(
    compilationId: string,
    resourceId: string,
    source: Buffer | string,
    compressor: CompressorOrPreset
  ): void {
    let compilation = this.resolveCompilation(compilationId);
    let sizeResolver: Resolver<string, Resource> | undefined;

    if (compilation) {
      sizeResolver = this.sizeResolvers.get(compilation);
    } else {
      compilation = {
        id: compilationId,
        resources: [],
      };
      sizeResolver = makeResolver(compilation.resources, (item) => item.id);
      this.sizeResolvers.set(compilation, sizeResolver);
      this.payload.compilations.push(compilation);
    }

    if (!sizeResolver!(resourceId)) {
      const resolveCompressor = this.resolveCompressor(compressor);
      const size = resolveCompressor(source, resourceId);
      compilation.resources.push({ id: resourceId, size });
    }
  }

  get(): Format {
    return { descriptor: this.descriptor, payload: this.payload };
  }

  private resolveCompressor(compressor: CompressorOrPreset): CompressFunction {
    if (typeof compressor === 'function') {
      return compressor;
    }

    if (Object.prototype.hasOwnProperty.call(compressorByType, compressor)) {
      return compressorByType[compressor];
    }

    throw new Error(`Unknown compress ${compressor}`);
  }
}
