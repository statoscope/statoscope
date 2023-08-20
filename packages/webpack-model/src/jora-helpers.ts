import makeEntityResolver from '@statoscope/helpers/dist/entity-resolver';
import { API as ExtensionCompressedAPI } from '@statoscope/stats-extension-compressed/dist/api';
import type { Size } from '@statoscope/stats-extension-compressed/dist/generator';
import { API as ExtensionPackageInfoAPI } from '@statoscope/stats-extension-package-info/dist/api';
import type { Instance } from '@statoscope/stats-extension-package-info/dist/generator';
import { API as ExtensionValidationResultAPI } from '@statoscope/stats-extension-stats-validation-result/dist/api';
import { API as ExtensionCustomReportsAPI } from '@statoscope/stats-extension-custom-reports/dist/api';
import Graph, { PathSolution } from '@statoscope/helpers/dist/graph';
import type { Item } from '@statoscope/stats-extension-stats-validation-result/dist/generator';
import { HelpersContext, RelationItem } from '@statoscope/types/types';
import { RuleDescriptor } from '@statoscope/types/types/validation/api';
import { Report } from '@statoscope/types/types/custom-report';
import { Webpack } from '../webpack';
import {
  ModuleGraphNodeData,
  NodeModuleInstance,
  NormalizedAsset,
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedEntrypointItem,
  NormalizedExtension,
  NormalizedModule,
  NormalizedPackage,
  NormalizeResult,
  NormalizedFile,
} from '../types';
import {
  moduleNameResource,
  moduleReasonResource,
  moduleResource,
  nodeModule,
} from './module';
import modulesToFoamTree, { Node as FoamTreeNode } from './modules-to-foam-tree';
import ChunkID = Webpack.ChunkID;

export type ResolvedStats = { file: NormalizedFile; compilation: NormalizedCompilation };

export type ResolvedRelatedItem =
  | { type: 'module'; item: NormalizedModule | null }
  | { type: 'chunk'; item: NormalizedChunk | null }
  | { type: 'resource'; item: NormalizedAsset | null }
  | { type: 'entry'; item: NormalizedEntrypointItem | null }
  | { type: 'compilation'; item: NormalizedCompilation | null }
  | { type: 'package'; item: NormalizedPackage | null }
  | { type: 'package-instance'; item: NodeModuleInstance | null };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function (normalizeResult: NormalizeResult, context: HelpersContext) {
  const compilations = normalizeResult.compilations;
  const resolveCompilation = makeEntityResolver(compilations, (item) => item?.data?.hash);
  const resolveFile = makeEntityResolver(
    compilations.map((c) => c.file),
    (item) => item.name
  );

  const resolveExtension = (
    fileName: string,
    id: string
  ): NormalizedExtension<unknown, unknown> | null => {
    return normalizeResult.resolvers.get(fileName)?.resolveExtension(id) ?? null;
  };

  const resolveExtensionByCompilation = (
    hash: string,
    id: string
  ): NormalizedExtension<unknown, unknown> | null => {
    const fileName = resolveCompilation(hash)?.file.name;

    if (!fileName) {
      return null;
    }

    return resolveExtension(fileName, id);
  };

  return {
    moduleSize(module: NormalizedModule): number {
      console.warn('moduleSize helper was deprecated. Use getModuleSize');
      return module.size;
    },
    chunkName(chunk: NormalizedChunk): string {
      const chunkNames = [...chunk.names, ...(chunk.idHints ?? [])];
      return `${chunkNames[0] ?? (chunk.name || chunk.id)}${
        chunk.reason ? ' [' + chunk.reason + ']' : ''
      }`;
    },
    assetChunkName(asset: NormalizedAsset): string | null {
      const chunkNames = [...(asset.chunkNames ?? []), ...(asset.chunkIdHints ?? [])];
      return chunkNames[0] ?? null;
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
        throw new Error('[getTotalFilesSize]: hash-parameter is required');
      }

      const ext = resolveExtensionByCompilation(
        hash,
        '@statoscope/stats-extension-compressed'
      );

      const resolverSize = ext?.api as ExtensionCompressedAPI | undefined;

      return files
        .map((f) => resolverSize?.(hash, f.name) ?? null)
        .reduce((sum, file) => sum + (file?.size ?? 0), 0);
    },
    resolveCompilationByAsset(
      asset: NormalizedAsset,
      fileName: string
    ): NormalizedCompilation | null {
      return (
        normalizeResult.resolvers.get(fileName)?.resolveCompilationByAsset(asset) ?? null
      );
    },
    resolveCompilationByChunk(
      chunk: NormalizedChunk,
      fileName: string
    ): NormalizedCompilation | null {
      return (
        normalizeResult.resolvers.get(fileName)?.resolveCompilationByChunk(chunk) ?? null
      );
    },
    resolveCompilationByModule(
      module: NormalizedModule,
      fileName: string
    ): NormalizedCompilation | null {
      return (
        normalizeResult.resolvers.get(fileName)?.resolveCompilationByModule(module) ??
        null
      );
    },
    resolveCompilationByEntrypoint(
      entrypoint: NormalizedEntrypointItem,
      fileName: string
    ): NormalizedCompilation | null {
      return (
        normalizeResult.resolvers
          .get(fileName)
          ?.resolveCompilationByEntrypoint(entrypoint) ?? null
      );
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
    resolveEntrypoint(
      id: string,
      compilationHash: string
    ): NormalizedEntrypointItem | null {
      return resolveCompilation(compilationHash)?.resolvers.resolveEntrypoint(id) || null;
    },
    resolveFile(id: string): NormalizedFile | null {
      return resolveFile(id);
    },
    resolveInputFile(): NormalizedFile | null {
      return this.resolveFile('input.json');
    },
    resolveReferenceFile(): NormalizedFile | null {
      return this.resolveFile('reference.json');
    },
    resolveStat(id: string): ResolvedStats | null {
      const resolved = resolveCompilation(id);
      return (resolved && { file: resolved?.file, compilation: resolved?.data }) || null;
    },
    resolveCompilation(id: string): NormalizedCompilation | null {
      const resolved = resolveCompilation(id);
      return (resolved && resolved?.data) || null;
    },
    resolveExtension(
      id: string,
      fileName: string
    ): NormalizedExtension<unknown, unknown> | null {
      return resolveExtension(fileName, id);
    },
    resolveExtensionByCompilation(
      id: string,
      hash: string
    ): NormalizedExtension<unknown, unknown> | null {
      return resolveExtensionByCompilation(hash, id);
    },
    getModuleSize(module: NormalizedModule, hash?: string, compressed?: boolean): Size {
      if (!compressed) {
        return { size: module.size };
      }

      if (!hash) {
        throw new Error('[getModuleSize]: hash-parameter is required');
      }

      const ext = resolveExtensionByCompilation(
        hash,
        '@statoscope/stats-extension-compressed'
      );

      const resolverSize = ext?.api as ExtensionCompressedAPI | undefined;

      return (
        resolverSize?.(hash, module.identifier) ?? {
          size: module.size,
        }
      );
    },
    getAssetSize(asset: NormalizedAsset, hash?: string, compressed?: boolean): Size {
      if (!compressed) {
        return { size: asset.size };
      }

      if (!hash) {
        throw new Error('[getAssetSize]: hash-parameter is required');
      }

      const ext = resolveExtensionByCompilation(
        hash,
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
        throw new Error('[getPackageInstanceInfo]: hash-parameter is required');
      }

      const ext = resolveExtensionByCompilation(
        hash,
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

      const moduleNode = graph.getNode(module.identifier);

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

          const entryModuleId = entry.data.dep?.module.identifier as string;
          const entryModule = graph.getNode(entryModuleId);

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

      const fromNode = graph.getNode(from.identifier);
      const toNode = graph.getNode(to.identifier);

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
        throw new Error('[modulesToFoamTree]: hash-parameter is required');
      }

      return modulesToFoamTree(modules, (module: NormalizedModule): Size => {
        if (compressed && hash) {
          return this.getModuleSize(module, hash, compressed);
        }

        return { size: module.size };
      });
    },

    validation_getItems(
      hash?: string,
      relatedType?: RelationItem['type'] | null,
      relatedId?: string | number
    ): Item[] {
      if (!hash) {
        throw new Error('[validation_getItems]: hash-parameter is required');
      }

      const ext = resolveExtensionByCompilation(
        hash,
        '@statoscope/stats-extension-stats-validation-result'
      );
      const api = ext?.api as ExtensionValidationResultAPI | undefined;

      return [
        ...(api?.getItems(null, relatedType, relatedId) ?? []),
        ...(api?.getItems(hash, relatedType, relatedId) ?? []),
      ];
    },
    validation_getItem(id?: number, hash?: string): Item | null {
      if (!hash) {
        throw new Error('[validation_getItem]: hash-parameter is required');
      }

      if (id == null) {
        throw new Error('[validation_getItem]: id-parameter is required');
      }

      const ext = resolveExtensionByCompilation(
        hash,
        '@statoscope/stats-extension-stats-validation-result'
      );
      const api = ext?.api as ExtensionValidationResultAPI | undefined;

      return api?.getItemById(id) ?? null;
    },

    validation_resolveRelatedItem(
      item?: RelationItem,
      hash?: string
    ): ResolvedRelatedItem {
      if (!item) {
        throw new Error('[validation_resolveRelatedItem]: item-parameter is required');
      }
      if (!hash) {
        throw new Error('[validation_resolveRelatedItem]: hash-parameter is required');
      }
      const compilation = resolveCompilation(hash);

      if (!compilation) {
        throw new Error("[validation_resolveRelatedItem]: can't resolve compilation");
      }

      if (item.type === 'package') {
        return { type: item.type, item: compilation.resolvers.resolvePackage(item.id) };
      }

      if (item.type === 'package-instance') {
        const instance = nodeModule(item.id)!;
        const thePackage = compilation.resolvers.resolvePackage(instance.name);
        const theInstance =
          thePackage?.instances.find((item) => item.path === instance.path) ?? null;

        return { type: item.type, item: theInstance };
      }

      if (item.type === 'module') {
        return { type: item.type, item: compilation.resolvers.resolveModule(item.id) };
      }

      if (item.type === 'entry') {
        return {
          type: item.type,
          item: compilation.resolvers.resolveEntrypoint(item.id),
        };
      }

      if (item.type === 'chunk') {
        return {
          type: item.type,
          item: compilation.resolvers.resolveChunk(item.id),
        };
      }

      if (item.type === 'compilation') {
        return {
          type: item.type,
          item: resolveCompilation(item.id)?.data ?? null,
        };
      }

      return {
        type: item.type,
        item: compilation.resolvers.resolveAsset(item.id),
      };
    },
    validation_resolveRule(name?: string, hash?: string): RuleDescriptor | null {
      if (!hash) {
        throw new Error('[validation_resolveRule]: hash-parameter is required');
      }

      if (name == null) {
        throw new Error('[validation_resolveRule]: name-parameter is required');
      }

      const ext = resolveExtensionByCompilation(
        hash,
        '@statoscope/stats-extension-stats-validation-result'
      );
      const api = ext?.api as ExtensionValidationResultAPI | undefined;

      return api?.getRule(name) ?? null;
    },

    customReports_getItems(
      file: string,
      hash?: string | null,
      relatedType?: RelationItem['type'] | null,
      relatedId?: string | number
    ): Report<unknown, unknown>[] {
      if (!file) {
        throw new Error('[customReports_getItems]: file-parameter is required');
      }

      const ext = normalizeResult.resolvers
        .get(file)
        ?.resolveExtension('@statoscope/stats-extension-custom-reports');
      const api = ext?.api as ExtensionCustomReportsAPI | undefined;

      return [
        ...(api?.getReports(null, relatedType, relatedId) ?? []),
        ...(api?.getReports(hash, relatedType, relatedId) ?? []),
      ];
    },
    customReports_getItem(id: string, file: string): Report<unknown, unknown> | null {
      if (!file) {
        throw new Error('[customReports_getItem]: file-parameter is required');
      }

      if (id == null) {
        throw new Error('[customReports_getItem]: id-parameter is required');
      }

      const ext = normalizeResult.resolvers
        .get(file)
        ?.resolveExtension('@statoscope/stats-extension-custom-reports');
      const api = ext?.api as ExtensionCustomReportsAPI | undefined;

      return api?.getById(id) ?? null;
    },

    asset_getSize(
      asset: NormalizedAsset,
      hash: string,
      useCompressedSize: boolean
    ): Size {
      return this.getAssetSize(asset, hash, useCompressedSize);
    },
    assets_getTotalSize(
      assets: NormalizedAsset[],
      hash: string,
      useCompressedSize: boolean
    ): Size {
      return context.query(
        `
        $hash: #.hash;
        $useCompressedSize: #.useCompressedSize;
        .[not name.shouldExcludeResource()].[]
        .(asset_getSize($hash, $useCompressedSize)) |
        $ ? .reduce(=> {
          $current: $;
          $all: $$;
          size: $all.size + $current.size,
          compressor: $all.compressor = $current.compressor ? $all.compressor : 'multiple'
        }) : {size: 0}`,
        assets,
        { useCompressedSize, hash }
      ) as Size;
    },

    entrypoint_getChunks(entrypoint: NormalizedEntrypointItem): NormalizedChunk[] {
      return context.query(
        `data.chunks + data.chunks..children`,
        entrypoint
      ) as NormalizedChunk[];
    },
    entrypoint_getInitialChunks(entrypoint: NormalizedEntrypointItem): NormalizedChunk[] {
      return this.entrypoint_getChunks(entrypoint).filter(
        (chunk) => chunk.initial
      ) as NormalizedChunk[];
    },
    entrypoint_getInitialSize(
      entrypoint: NormalizedEntrypointItem,
      hash: string,
      useCompressedSize: boolean
    ): Size {
      return this.assets_getTotalSize(
        this.entrypoint_getInitialAssets(entrypoint),
        hash,
        useCompressedSize
      );
    },
    entrypoint_getAsyncChunks(entrypoint: NormalizedEntrypointItem): NormalizedChunk[] {
      return this.entrypoint_getChunks(entrypoint).filter((chunk) => !chunk.initial);
    },
    entrypoint_getAsyncSize(
      entrypoint: NormalizedEntrypointItem,
      hash: string,
      useCompressedSize: boolean
    ): Size {
      return this.assets_getTotalSize(
        this.entrypoint_getAsyncAssets(entrypoint),
        hash,
        useCompressedSize
      );
    },
    entrypoint_getAssets(entrypoint: NormalizedEntrypointItem): NormalizedAsset[] {
      return context.query(
        `(data.chunks + data.chunks..children).files`,
        entrypoint
      ) as NormalizedAsset[];
    },
    entrypoint_getInitialAssets(entrypoint: NormalizedEntrypointItem): NormalizedAsset[] {
      return context.query(
        `(data.chunks + data.chunks..children).[initial].files`,
        entrypoint
      ) as NormalizedAsset[];
    },
    entrypoint_getAsyncAssets(entrypoint: NormalizedEntrypointItem): NormalizedAsset[] {
      return context.query(
        `(data.chunks + data.chunks..children).[not initial].files`,
        entrypoint
      ) as NormalizedAsset[];
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    module_uniq_retained: (() => {
      const cache = new WeakMap<NormalizedModule, Set<NormalizedModule>>();

      return (module?: NormalizedModule): NormalizedModule[] => {
        if (!module) {
          return [];
        }

        const cached = cache.get(module);

        if (cached) {
          return [...cached];
        }

        const passed = new Set<NormalizedModule>();
        const stack = [module];
        let cursor: NormalizedModule | undefined;

        while ((cursor = stack.pop())) {
          if (passed.has(cursor)) {
            continue;
          }

          if (
            cursor.reasons.some(
              (r) =>
                r.resolvedModule &&
                r.resolvedModule !== module &&
                !passed.has(r.resolvedModule)
            )
          ) {
            continue;
          }

          passed.add(cursor);

          for (const dep of cursor.deps ?? []) {
            if (dep.module) {
              stack.push(dep.module);
            }
          }
        }

        passed.delete(module);

        cache.set(module, passed);

        return [...passed];
      };
    })(),
  };
}
