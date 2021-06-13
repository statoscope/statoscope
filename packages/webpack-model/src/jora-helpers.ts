import { Module as StatoscopeModule } from '@statoscope/stats/spec/module';
import { Compilation as StatoscopeCompilation } from '@statoscope/stats/spec/compilation';
import { Asset as StatoscopeAsset } from '@statoscope/stats/spec/asset';
import { Size } from '@statoscope/stats/spec/source';
import { Webpack } from '../webpack';
import {
  moduleNameResource,
  moduleReasonResource,
  moduleResource,
  nodeModule,
} from './module';
import makeEntityResolver, { Resolver } from './entity-resolver';
import {
  HandledCompilation,
  NormalizedAsset,
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedFile,
  NormalizedModule,
  NormalizedPackage,
} from './normalize';
import modulesToFoamTree from './modules-to-foam-tree';
import { Node } from './modules-to-foam-tree';
import ChunkID = Webpack.ChunkID;

export type ResolvedStats = { file: NormalizedFile; compilation: NormalizedCompilation };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function (compilations: HandledCompilation[], files: NormalizedFile[]) {
  const resolveCompilation = makeEntityResolver(compilations, (item) => item?.data?.hash);

  const metaCompilations: {
    file: NormalizedFile;
    compilation: StatoscopeCompilation;
  }[] = [];

  for (const file of files) {
    for (const compilation of file.__statoscope?.compilations || []) {
      metaCompilations.push({ file, compilation });
    }
  }

  const resolveMetaCompilation = makeEntityResolver(
    metaCompilations,
    (item) => item.compilation.id
  );

  const metaCompilationResolvers: Map<
    StatoscopeCompilation,
    {
      resolveModule: Resolver<string, StatoscopeModule>;
      resolveAsset: Resolver<string, StatoscopeAsset>;
    }
  > = new Map();

  for (const item of metaCompilations) {
    metaCompilationResolvers.set(item.compilation, {
      resolveModule: makeEntityResolver(
        item.compilation.modules,
        (item) => item.resource
      ),
      resolveAsset: makeEntityResolver(item.compilation.assets, (item) => item.id),
    });
  }

  return {
    moduleSize(module: NormalizedModule): number {
      console.warn('moduleSize helper was deprecated. Use getModuleSize');
      return module.size;
    },
    chunkName(chunk: NormalizedChunk): string {
      return `${chunk.names[0] ? chunk.names.join(', ') : chunk.name || chunk.id}${
        chunk.reason ? ' [' + chunk.reason + ']' : ''
      }`;
    },
    getTotalFilesSize: (asset: NormalizedAsset): number =>
      asset.files.reduce((sum, file) => sum + file.size, 0),
    resolveChunk(id: ChunkID, compilationHash: string): NormalizedChunk | null {
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
    getModuleSize(module: NormalizedModule, hash: string, compressed: boolean): Size {
      if (compressed) {
        if (!hash) {
          throw new Error('[getModuleSize-helper]: hash-parameter is required');
        }

        const metaCompilation = resolveMetaCompilation(hash);
        if (!metaCompilation) {
          return { size: module.size };
        }

        const resolvers = metaCompilationResolvers.get(metaCompilation.compilation);
        if (!resolvers) {
          return { size: module.size };
        }

        const metaModule = resolvers.resolveModule(module.name);
        if (!metaModule) {
          return { size: module.size };
        }

        return metaModule.source?.sizes[0] ?? { size: module.size };
      }

      return { size: module.size };
    },
    getAssetSize(asset: NormalizedAsset, hash: string, compressed: boolean): Size {
      if (compressed) {
        if (!hash) {
          throw new Error('[getAssetSize-helper]: hash-parameter is required');
        }

        const metaCompilation = resolveMetaCompilation(hash);
        if (!metaCompilation) {
          return { size: asset.size };
        }

        const resolvers = metaCompilationResolvers.get(metaCompilation.compilation);
        if (!resolvers) {
          return { size: asset.size };
        }

        const metaAsset = resolvers.resolveAsset(asset.name);
        if (!metaAsset) {
          return { size: asset.size };
        }

        return metaAsset.source?.sizes[0] ?? { size: asset.size };
      }

      return { size: asset.size };
    },
    moduleResource,
    moduleReasonResource,
    moduleNameResource,
    nodeModule,
    statName(stat?: ResolvedStats): string {
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
    modulesToFoamTree(
      modules: NormalizedModule[],
      hash?: string,
      compressed?: boolean
    ): Node {
      if (compressed && !hash) {
        throw new Error('[modulesToFoamTree-helper]: hash-parameter is required');
      }

      return modulesToFoamTree(modules, (module: NormalizedModule): Size => {
        if (compressed && hash) {
          return this.getModuleSize(module, hash, compressed);
        }

        return { size: module.size };
      });
    },
  };
}
