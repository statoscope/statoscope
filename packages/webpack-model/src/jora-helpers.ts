import {
  moduleResource,
  moduleNameResource,
  moduleReasonResource,
  nodeModule,
} from './module';
import makeEntityResolver from './entity-resolver';
import {
  HandledCompilation,
  NormalizedAsset,
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
  NormalizedPackage,
} from './normalize';

export type ResolvedStats = { file: NormalizedFile; compilation: NormalizedCompilation };

export default function (compilations: HandledCompilation[]): Record<string, unknown> {
  const resolveCompilation = makeEntityResolver(compilations, (item) => item?.data?.hash);

  return {
    moduleSize(module: NormalizedModule): number {
      // todo gzip
      return module.size;
    },
    chunkName(chunk: NormalizedChunk): string {
      return `${chunk.names[0] ? chunk.names.join(', ') : chunk.id}${
        chunk.reason ? ' [' + chunk.reason + ']' : ''
      }`;
    },
    getTotalFilesSize: (asset: NormalizedAsset): number =>
      asset.files.reduce((sum, file) => sum + file.size, 0),
    resolveChunk(id: string, compilationHash: string): NormalizedChunk | null {
      return resolveCompilation(compilationHash)?.resolvers.resolveChunk(id) || null;
    },
    resolveAsset(id: string, compilationHash: string): NormalizedAsset | null {
      return resolveCompilation(compilationHash)?.resolvers.resolveAsset(id) || null;
    },
    resolveModule(id: string, compilationHash: string): NormalizedModule | null {
      return resolveCompilation(compilationHash)?.resolvers.resolveModule(id) || null;
    },
    resolvePackage(id: string, compilationHash: string): NormalizedPackage | null {
      return resolveCompilation(compilationHash)?.resolvers.resolvePackage(id) || null;
    },
    resolveStat(id: string): ResolvedStats | null {
      const resolved = resolveCompilation(id);
      return (resolved && { file: resolved?.file, compilation: resolved?.data }) || null;
    },
    resolveCompilation(id: string): NormalizedCompilation | null {
      const resolved = resolveCompilation(id);
      return (resolved && resolved?.data) || null;
    },
    moduleResource,
    moduleReasonResource,
    moduleNameResource,
    nodeModule,
    statName(stat: ResolvedStats): string {
      if (!stat) {
        return 'unknown';
      }

      const hash = stat.compilation.hash.slice(0, 7);
      const compilationName =
        stat.compilation.name && moduleNameResource(stat.compilation.name);

      if (stat.file.name) {
        return `${stat.file.name} (${compilationName || hash})`;
      } else if (compilationName) {
        return `${compilationName} (${hash})`;
      }

      return hash;
    },
  };
}
