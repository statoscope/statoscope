import { ZlibOptions } from 'zlib';
import { Extension, ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import makeResolver, { Resolver } from '@statoscope/helpers/dist/entity-resolver';
import gzipSize from 'gzip-size';
import { name, version, author, homepage, description } from './version';

export type Compressor = string | { name: string; version: string };
export type Size = {
  compressor?: Compressor;
  size: number;
  meta?: unknown;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompressFunction<TOptions = any> = (
  source: Buffer | string,
  filename: string,
  options?: TOptions
) => Size;

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
  gzip(source: Buffer | string, filename: string, options?: ZlibOptions): Size {
    const level = options?.level ?? 6;
    return {
      compressor: 'gzip',
      size: gzipSize.sync(source, { level, ...options }),
      meta: {
        level: 6,
      },
    };
  },
};

export type ResolvedCompressor = {
  compressor: CompressFunction<unknown>;
  params?: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompressorOrPreset = string | ['gzip', ZlibOptions?] | CompressFunction;

export default class Generator {
  private sizeResolvers: Map<Compilation, Resolver<string, Resource>> = new Map();
  private descriptor: ExtensionDescriptor = {
    name,
    version,
    author,
    homepage,
    description,
    adapter: this.adapter,
  };
  private payload: Payload = { compilations: [] };
  private resolveCompilation = makeResolver(
    this.payload.compilations,
    (item) => item.id,
    null,
    false
  );

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
      sizeResolver = makeResolver(compilation.resources, (item) => item.id, null, false);
      this.sizeResolvers.set(compilation, sizeResolver);
      this.payload.compilations.push(compilation);
    }

    if (!sizeResolver!(resourceId)) {
      const resolvedCompressor = this.resolveCompressor(compressor);
      const size = resolvedCompressor.compressor(
        source,
        resourceId,
        resolvedCompressor.params
      );
      compilation.resources.push({ id: resourceId, size });
    }
  }

  get(): Format {
    return { descriptor: this.descriptor, payload: this.payload };
  }

  private resolveCompressor(compressor: CompressorOrPreset): ResolvedCompressor {
    if (compressor === 'gzip') {
      compressor = [compressor];
    }

    if (typeof compressor === 'function') {
      return { compressor };
    }

    if (Array.isArray(compressor)) {
      const [name, params] = compressor;
      if (Object.prototype.hasOwnProperty.call(compressorByType, name)) {
        return { compressor: compressorByType[name], params };
      }
    }

    throw new Error(`Unknown compress ${compressor}`);
  }
}
