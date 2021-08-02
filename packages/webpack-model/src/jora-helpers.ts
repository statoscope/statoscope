import makeEntityResolver from '@statoscope/helpers/dist/entity-resolver';
import { API as ExtensionCompressedAPI } from '@statoscope/stats-extension-compressed/dist/api';
import type { Size } from '@statoscope/stats-extension-compressed/dist/generator';
import { API as ExtensionPackageInfoAPI } from '@statoscope/stats-extension-package-info/dist/api';
import type { Instance } from '@statoscope/stats-extension-package-info/dist/generator';
import Graph, { PathSolution } from '@statoscope/helpers/dist/graph';
import { Webpack } from '../webpack';
import {
  moduleNameResource,
  moduleReasonResource,
  moduleResource,
  nodeModule,
} from './module';
import {
  HandledCompilation,
  ModuleGraphNodeData,
  NormalizedAsset,
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
  NormalizedFile,
  NormalizedModule,
  NormalizedPackage,
} from './normalize';
import modulesToFoamTree from './modules-to-foam-tree';
import { Node as FoamTreeNode } from './modules-to-foam-tree';
import ChunkID = Webpack.ChunkID;

export type ResolvedStats = { file: NormalizedFile; compilation: NormalizedCompilation };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function (compilations: HandledCompilation[]) {
  const resolveCompilation = makeEntityResolver(compilations, (item) => item?.data?.hash);

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
    getTotalFilesSize: (
      asset: NormalizedAsset,
      hash?: string,
      compressed?: boolean
    ): number => {
      const files: Webpack.File[] = asset.files.length
        ? asset.files
        : [{ name: asset.name, size: asset.size }];

      if (!compressed) {
        return files.reduce((sum, file) => sum + file.size, 0);
      }

      if (!hash) {
        throw new Error('[getTotalFilesSize-helper]: hash-parameter is required');
      }

      const ext = resolveCompilation(hash)?.resolvers.resolveExtension(
        '@statoscope/stats-extension-compressed'
      );

      const resolverSize = ext?.api as ExtensionCompressedAPI | undefined;

      return files
        .map((f) => resolverSize?.(hash, f.name) ?? null)
        .reduce((sum, file) => sum + (file?.size ?? 0), 0);
    },
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
    resolveExtension(id: string, hash: string): unknown {
      return resolveCompilation(hash)?.resolvers.resolveExtension(id);
    },
    getModuleSize(module: NormalizedModule, hash?: string, compressed?: boolean): Size {
      if (!compressed) {
        return { size: module.size };
      }

      if (!hash) {
        throw new Error('[getModuleSize-helper]: hash-parameter is required');
      }

      const ext = resolveCompilation(hash)?.resolvers.resolveExtension(
        '@statoscope/stats-extension-compressed'
      );

      const resolverSize = ext?.api as ExtensionCompressedAPI | undefined;

      return (
        resolverSize?.(hash, module.name) ?? {
          size: module.size,
        }
      );
    },
    getAssetSize(asset: NormalizedAsset, hash?: string, compressed?: boolean): Size {
      if (!compressed) {
        return { size: asset.size };
      }

      if (!hash) {
        throw new Error('[getAssetSize-helper]: hash-parameter is required');
      }

      const ext = resolveCompilation(hash)?.resolvers.resolveExtension(
        '@statoscope/stats-extension-compressed'
      );
      const resolverSize = ext?.api as ExtensionCompressedAPI | undefined;

      return (
        resolverSize?.(hash, asset.name) ?? {
          size: asset.size,
        }
      );
    },
    getPackageInstanceInfo(
      packageName: string,
      instancePath: string,
      hash: string
    ): Instance | null {
      if (!hash) {
        throw new Error('[getPackageInstanceInfo-helper]: hash-parameter is required');
      }

      const ext = resolveCompilation(hash)?.resolvers.resolveExtension(
        '@statoscope/stats-extension-package-info'
      );
      const api = ext?.api as ExtensionPackageInfoAPI | undefined;

      return api?.getInstance(hash, packageName, instancePath) ?? null;
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
    getModuleGraph(hash: string): Graph<ModuleGraphNodeData> | null {
      return resolveCompilation(hash)?.graph.module ?? null;
    },
    moduleGraph_getEntrypoints(
      module?: NormalizedModule | null,
      graph?: Graph<ModuleGraphNodeData>,
      entrypoints?: NormalizedEntrypointItem[],
      max = Infinity
    ): NormalizedEntrypointItem[] {
      if (!module || !graph || !entrypoints) {
        return [];
      }

      const moduleNode = graph.getNode(module.name);

      if (!moduleNode) {
        return [];
      }

      let total = 0;

      return entrypoints.filter(
        // @ts-ignore
        (entry) => {
          if (total === max) {
            return false;
          }

          const entryModuleName = entry.data.dep?.module.name as string;
          const entryModule = graph.getNode(entryModuleName);

          if (entryModule) {
            if (moduleNode === entryModule) {
              total++;
              return true;
            }

            const solution = graph.findPaths(moduleNode, entryModule, 1);

            if (solution.children.length) {
              total++;
              return true;
            }
          }

          return false;
        }
      );
    },

    moduleGraph_getPaths(
      from?: NormalizedModule,
      graph?: Graph<ModuleGraphNodeData>,
      to?: NormalizedModule,
      max = Infinity
    ): PathSolution<ModuleGraphNodeData> | null {
      if (!from || !to || !graph) {
        return null;
      }

      const fromNode = graph.getNode(from.name);
      const toNode = graph.getNode(to.name);

      if (!fromNode || !toNode) {
        return null;
      }

      return graph.findPaths(fromNode, toNode, max);
    },
    modulesToFoamTree(
      modules: NormalizedModule[],
      hash?: string,
      compressed?: boolean
    ): FoamTreeNode {
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
