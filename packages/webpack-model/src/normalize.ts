import md5 from 'md5';
import { StatsDescriptor } from '@statoscope/stats';
import { Extension } from '@statoscope/stats/spec/extension';
import makeEntityResolver, { Resolver } from '@statoscope/helpers/dist/entity-resolver';
import Container from '@statoscope/extensions';
import ExtensionCompressedAPIFactory from '@statoscope/stats-extension-compressed/dist/api';
import ExtensionCompressedPackage from '@statoscope/stats-extension-compressed/package.json';
import ExtensionPackageInfoAPIFactory, {
  API as ExtensionPackageInfoAPI,
} from '@statoscope/stats-extension-package-info/dist/api';
import ExtensionPackageInfoPackage from '@statoscope/stats-extension-package-info/package.json';
import ExtensionValidationResultPackage from '@statoscope/stats-extension-stats-validation-result/package.json';
import ExtensionValidationResultAPIFactory from '@statoscope/stats-extension-stats-validation-result/dist/api';
import Graph, { Node } from '@statoscope/helpers/dist/graph';
import { Webpack } from '../webpack';
import validateStats, { ValidationResult } from './validate';
import { moduleReasonResource, moduleResource, nodeModule } from './module';
import denormalizeCompilation from './denormalizeCompilation';
import ChunkID = Webpack.ChunkID;
import Reason = Webpack.Reason;

export const normalizedSymbol = Symbol('sttoscope.normalized');

export type NormalizedChunk = Omit<
  Webpack.Chunk,
  'modules' | 'files' | 'children' | 'parents' | 'siblings'
> & {
  modules: NormalizedModule[];
  files: NormalizedAsset[];
  children: NormalizedChunk[];
  parents: NormalizedChunk[];
  siblings: NormalizedChunk[];
};
export type NormalizedEntrypointItem = { name: string; data: NormalizedEntrypoint };
export type NormalizedEntrypoint = Omit<Webpack.Entrypoint, 'chunks' | 'assets'> & {
  chunks: NormalizedChunk[];
  assets: NormalizedAsset[];
  dep?: NormalizedModuleDependency;
};
export type NormalizedAsset = Omit<Webpack.Asset, 'chunks' | 'files'> & {
  chunks: NormalizedChunk[];
  files: Webpack.File[];
};
export type NormalizedIssuerPathItem = Webpack.IssuerPathItem & {
  resolvedModule: NormalizedModule | null;
  resolvedEntry?: NormalizedEntrypointItem | null;
  resolvedEntryName?: string | null;
};
export type NormalizedReason = Webpack.Reason & {
  resolvedModule: NormalizedModule | null;
  resolvedEntry?: NormalizedEntrypointItem | null;
  resolvedEntryName?: string | null;
};
export type NormalizedModuleDependency = {
  type: 'module';
  module: NormalizedModule;
  reason: NormalizedReason;
};
export type NormalizedModule = Omit<Webpack.Module, 'chunks' | 'reasons' | 'modules'> & {
  resolvedResource: string | null;
  resolvedModule: NormalizedModule | null;
  issuerPath: NormalizedIssuerPathItem[];
  chunks: NormalizedChunk[];
  reasons: NormalizedReason[];
  modules: NormalizedModule[];
  deps?: NormalizedModuleDependency[];
};
export type NormalizedPackage = {
  name: string;
  instances: NodeModuleInstance[];
};
export type NodeModuleInstance = {
  path: string;
  isRoot: boolean;
  reasons: Array<{ type: 'module' | 'entry'; data: NormalizedReason }>;
  modules: NormalizedModule[];
  version?: string;
};

export type NormalizedCompilation = {
  time?: number;
  builtAt?: number;
  name?: string;
  hash: string;
  entrypoints: NormalizedEntrypointItem[];
  chunks: NormalizedChunk[];
  assets: NormalizedAsset[];
  modules: NormalizedModule[];
  nodeModules: NormalizedPackage[];
  children: NormalizedCompilation[];
  isChild: boolean;
  parent: string | null;
};

export type RawStatsFileDescriptor = { name: string; data: Webpack.Compilation };

export type NormalizedFile = {
  name: string;
  version: string;
  validation: ValidationResult;
  compilations: NormalizedCompilation[];
  __statoscope?: { descriptor?: StatsDescriptor; extensions?: Extension<unknown>[] };
};

export type NormalizedExtension<TPayload, TAPI> = {
  data: Extension<TPayload>;
  api: TAPI;
};

export type HandledStats = {
  file: NormalizedFile;
  compilations: HandledCompilation[];
};

export type CompilationResolvers = {
  resolveModule: Resolver<string, NormalizedModule>;
  resolveChunk: Resolver<ChunkID, NormalizedChunk>;
  resolveAsset: Resolver<string, NormalizedAsset>;
  resolvePackage: Resolver<string, NormalizedPackage>;
  resolveEntrypoint: Resolver<string, NormalizedEntrypointItem>;
  resolveExtension: Resolver<string, NormalizedExtension<unknown, unknown> | null>;
};

export type HandledCompilation = {
  data: NormalizedCompilation;
  resolvers: CompilationResolvers;
  graph: {
    module: Graph<ModuleGraphNodeData>;
  };
  file: NormalizedFile;
};

export type NormalizeResult = {
  files: NormalizedFile[];
  compilations: HandledCompilation[];
};

// todo: make it injectable
const extensionContainer = new Container();

extensionContainer.register(
  ExtensionCompressedPackage.name,
  ExtensionCompressedPackage.version,
  ExtensionCompressedAPIFactory
);

extensionContainer.register(
  ExtensionPackageInfoPackage.name,
  ExtensionPackageInfoPackage.version,
  ExtensionPackageInfoAPIFactory
);

extensionContainer.register(
  ExtensionValidationResultPackage.name,
  ExtensionValidationResultPackage.version,
  ExtensionValidationResultAPIFactory
);

function getHash(
  compilation: Webpack.Compilation,
  parent?: NormalizedCompilation | null
): string {
  if (compilation.hash) {
    return compilation.hash;
  }

  if (parent) {
    return md5(parent.hash + String(compilation.name));
  }

  return md5(compilation.name || 'unknown');
}

export default function normalize(
  rawData: RawStatsFileDescriptor | RawStatsFileDescriptor[]
): NormalizeResult {
  const files = [];
  const compilations = [];

  if (!Array.isArray(rawData)) {
    rawData = [rawData];
  }

  for (const rawFile of rawData) {
    const handledFile = handleRawFile(rawFile);
    files.push(handledFile.file);
    compilations.push(...handledFile.compilations);
  }

  return { files, compilations };
}

export function handleRawFile(
  rawStatsFileDescriptor: RawStatsFileDescriptor
): HandledStats {
  denormalizeCompilation(rawStatsFileDescriptor.data);

  const file: NormalizedFile = {
    name: rawStatsFileDescriptor.name,
    version: rawStatsFileDescriptor.data.version || 'unknown',
    validation: validateStats(rawStatsFileDescriptor.data),
    compilations: [],
    __statoscope: rawStatsFileDescriptor.data.__statoscope,
  };
  const compilations = [];

  type StackItem = {
    compilation: Webpack.Compilation;
    parent: NormalizedCompilation | null;
  };
  const stack: StackItem[] = [
    {
      compilation: rawStatsFileDescriptor.data,
      parent: null,
    },
  ];
  let cursor: StackItem | undefined;

  while ((cursor = stack.pop())) {
    const handled = handleCompilation(cursor.compilation, file, cursor.parent);

    if (cursor.parent) {
      cursor.parent.children.push(handled.data);
    }

    file.compilations.push(handled.data);
    compilations.push(handled);

    for (const child of cursor.compilation.children || []) {
      stack.push({ compilation: child, parent: handled.data });
    }
  }

  return { file, compilations };
}

export type ModuleGraphNodeData = {
  module: NormalizedModule;
  entries?: NormalizedEntrypointItem[];
};

function buildGraph(compilation: NormalizedCompilation): {
  module: Graph<ModuleGraphNodeData>;
} {
  const moduleGraph = new Graph<ModuleGraphNodeData>();
  const globalHandled = new Set<NormalizedModule>();

  for (const entry of compilation.entrypoints) {
    if (entry.data.dep?.module) {
      handleModuleNode(moduleGraph, entry.data.dep.module);
    }
  }

  return {
    module: moduleGraph,
  };

  function handleModuleNode(
    graph: Graph<ModuleGraphNodeData>,
    module: NormalizedModule
  ): Node<ModuleGraphNodeData> {
    if (globalHandled.has(module)) {
      return graph.getNode(module.identifier)!;
    }

    globalHandled.add(module);

    const entries = module.reasons
      .filter((r) => r.resolvedEntry)
      .map((r) => r.resolvedEntry!);
    const node =
      graph.getNode(module.identifier) ??
      graph.makeNode(module.identifier, { module, entries });
    const handled = new WeakSet<NormalizedModule>();

    for (const innerModule of module.modules) {
      handled.add(innerModule);
      node.addChild(handleModuleNode(graph, innerModule));
    }

    for (const dep of module.deps ?? []) {
      if (handled.has(dep.module)) {
        continue;
      }

      handled.add(dep.module);
      node.addChild(handleModuleNode(graph, dep.module));
    }

    return node;
  }
}

function handleCompilation(
  compilation: Webpack.Compilation,
  file: NormalizedFile,
  parent?: NormalizedCompilation | null
): HandledCompilation {
  const normalized: NormalizedCompilation = {
    time: compilation.time,
    builtAt: compilation.builtAt,
    name: compilation.name,
    hash: getHash(compilation, parent),
    entrypoints: [],
    chunks: (compilation.chunks as unknown as NormalizedChunk[]) || [],
    assets: (compilation.assets as unknown as NormalizedAsset[]) || [],
    modules: (compilation.modules as unknown as NormalizedModule[]) || [],
    nodeModules: [],
    children: [],
    isChild: !!parent?.hash,
    parent: parent?.hash || null,
  };

  const extensions =
    file.__statoscope?.extensions?.map((ext): NormalizedExtension<
      unknown,
      unknown
    > | null => {
      const item = extensionContainer.resolve(ext.descriptor.name);
      if (!item) {
        console.warn(`Unknown extension ${ext.descriptor.name}:`, ext);
        return null;
      }

      return {
        data: ext,
        api: item.apiFactory(ext),
      };
    }) ?? [];

  const resolveModule = makeModuleResolver(normalized);
  const resolveChunk = makeEntityResolver(normalized.chunks, ({ id }) => id);
  const resolveAsset = makeEntityResolver(normalized.assets || [], ({ name }) => name);
  const resolvePackage = makeEntityResolver(
    normalized.nodeModules,
    ({ name }) => name,
    null,
    false
  );
  const resolveExtension = makeEntityResolver(
    extensions,
    (ext) => ext?.data.descriptor.name
  );

  normalized.entrypoints = prepareEntries(compilation, resolveChunk, resolveAsset);
  const resolveEntrypoint = makeEntityResolver(
    normalized.entrypoints,
    ({ name }) => name
  );

  const resolvers: CompilationResolvers = {
    resolveModule,
    resolveChunk,
    resolveAsset,
    resolvePackage,
    resolveEntrypoint,
    resolveExtension,
  };

  prepareModules(compilation, resolvers);
  prepareChunks(compilation, resolvers);
  prepareAssets(compilation, resolvers);
  extractPackages(normalized, resolvers);

  const graph = buildGraph(normalized);

  resolvePackage.lock();

  return {
    data: normalized,
    resolvers,
    graph: {
      module: graph.module,
    },
    file,
  };
}

function makeModuleResolver(
  compilation: NormalizedCompilation
): Resolver<string, NormalizedModule> {
  const modules: NormalizedModule[] = [...compilation.modules];
  const resolve = makeEntityResolver(
    modules,
    ({ identifier }) => identifier,
    null,
    false
  );

  for (const chunk of compilation.chunks) {
    for (const [ix, module] of Object.entries(chunk.modules || [])) {
      const resolved = resolve(module.identifier);

      if (!resolved) {
        modules.push(module);
      } else {
        const chunks = new Set([...resolved.chunks, ...chunk.modules[+ix].chunks]);
        resolved.chunks = [...chunks];
        chunk.modules[+ix] = resolved;
      }
    }
  }

  compilation.modules.length = 0;

  const resolveFromCompilation = makeEntityResolver(
    compilation.modules,
    ({ identifier }) => identifier,
    null,
    false
  );

  for (const module of [...modules]) {
    if (!resolveFromCompilation(module.identifier)) {
      compilation.modules.push(module);
    }

    for (const innerModule of module.modules || []) {
      if (!resolve(innerModule.identifier)) {
        modules.push(innerModule);
      }
      if (!resolveFromCompilation(innerModule.identifier)) {
        compilation.modules.push(innerModule);
      }
    }
  }

  resolve.lock();

  return resolve;
}

function prepareModule(
  module: Webpack.Module | Webpack.InnerModule,
  resolvers: CompilationResolvers
): void {
  // @ts-ignore
  if (module[normalizedSymbol]) {
    return;
  }

  // @ts-ignore
  module[normalizedSymbol] = true;

  const { resolveChunk, resolveModule } = resolvers;

  (module as unknown as NormalizedModule).resolvedResource = moduleResource(
    module as unknown as NormalizedModule
  );

  if (module.issuerPath) {
    module.issuerPath.map(
      (i) =>
        ((i as NormalizedIssuerPathItem).resolvedModule = resolveModule(i.identifier))
    );
  }

  if (module.chunks) {
    (module as unknown as NormalizedModule).chunks = module.chunks
      .map((c) => resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id))
      .filter(Boolean) as NormalizedChunk[];
  } else {
    module.chunks = [];
  }

  if (module.reasons) {
    module.reasons = module.reasons.filter(
      (r) => r.moduleIdentifier !== module.identifier
    );
    for (const reason of module.reasons) {
      normalizeReason(reason, resolvers);
      const resolvedModule = (reason as NormalizedReason).resolvedModule;
      const resolvedEntry = (reason as NormalizedReason).resolvedEntry;

      if (resolvedModule) {
        resolvedModule.deps ??= [];
        resolvedModule.deps.push({
          type: 'module',
          module: module as NormalizedModule,
          reason: reason as NormalizedReason,
        });
      }

      if (resolvedEntry) {
        resolvedEntry.data.dep = {
          type: 'module',
          module:
            (reason as NormalizedReason).resolvedModule ?? (module as NormalizedModule),
          reason: reason as NormalizedReason,
        };
      }
    }
  } else {
    module.reasons = [];
  }

  // @ts-ignore
  module.modules = module.modules || [];
}

function normalizeReason(
  reason: Reason,
  { resolveEntrypoint, resolveModule }: CompilationResolvers
): void {
  (reason as NormalizedReason).resolvedModule = reason.moduleIdentifier
    ? resolveModule(reason.moduleIdentifier)
    : null;

  if (/(?:.+ )?entry$/.test(reason.type ?? '')) {
    if (reason.loc) {
      let resolvedName = reason.loc;
      let resolved = resolveEntrypoint(resolvedName);

      if (!resolved) {
        // handle foo[0] for webpack 4 single entry
        resolvedName = reason.loc.slice(0, -3);
        resolved = resolveEntrypoint(resolvedName);
      }

      if (resolved) {
        (reason as NormalizedReason).resolvedEntryName = resolvedName;
        (reason as NormalizedReason).resolvedEntry = resolved;
      }
    }
  }
}

function prepareModules(
  compilation: Webpack.Compilation,
  resolvers: CompilationResolvers
): void {
  for (const [i, module] of Object.entries(compilation.modules || [])) {
    const resolved = resolvers.resolveModule(module.identifier);
    if (resolved) {
      (compilation as unknown as NormalizedCompilation).modules[+i] = resolved;
    }

    prepareModule(module, resolvers);

    if (module.modules) {
      for (const [i, innerModule] of Object.entries(module.modules)) {
        const resolved = resolvers.resolveModule(innerModule.identifier);
        if (resolved) {
          (module as unknown as NormalizedModule).modules[+i] = resolved;
        }

        prepareModule(innerModule, resolvers);
      }
    } else {
      module.modules = [];
    }
  }
}

function prepareChunk(chunk: Webpack.Chunk, resolvers: CompilationResolvers): void {
  const { resolveModule, resolveAsset, resolveChunk } = resolvers;

  // @ts-ignore
  if (chunk[normalizedSymbol]) {
    return;
  }

  // @ts-ignore
  chunk[normalizedSymbol] = true;

  if (chunk.modules) {
    (chunk as unknown as NormalizedChunk).modules = chunk.modules
      .map((m) => resolveModule(m.identifier))
      .filter(Boolean) as NormalizedModule[];

    for (const [i, module] of Object.entries(chunk.modules)) {
      const resolved = resolvers.resolveModule(module.identifier);
      if (resolved) {
        const chunks = new Set([...resolved.chunks, ...chunk.modules[+i].chunks]);
        resolved.chunks = [...chunks].map((chunk) =>
          typeof chunk === 'string' || typeof chunk === 'number'
            ? (resolveChunk(chunk) as NormalizedChunk)
            : (chunk as NormalizedChunk)
        );
        (chunk as unknown as NormalizedChunk).modules[+i] = resolved;
      }

      prepareModule(module, resolvers);

      if (module.modules) {
        for (const [i, innerModule] of Object.entries(module.modules)) {
          const resolved = resolvers.resolveModule(innerModule.identifier);
          if (resolved) {
            (module as unknown as NormalizedModule).modules[+i] = resolved;
          }

          prepareModule(innerModule, resolvers);
        }
      } else {
        module.modules = [];
      }
    }
  } else {
    chunk.modules = [];
  }

  if (chunk.files) {
    (chunk as unknown as NormalizedChunk).files = chunk.files
      .map((f) => resolveAsset(typeof f === 'string' ? f : f.name))
      .filter(Boolean) as NormalizedAsset[];
  } else {
    chunk.files = [];
  }

  if (chunk.children) {
    (chunk as unknown as NormalizedChunk).children = chunk.children
      .map((c) => resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id))
      .filter(Boolean) as NormalizedChunk[];
    for (const children of chunk.children as Webpack.Chunk[]) {
      prepareChunk(children, resolvers);
    }
  } else {
    chunk.children = [];
  }

  if (chunk.siblings) {
    (chunk as unknown as NormalizedChunk).siblings = chunk.siblings
      .map((c) => resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id))
      .filter(Boolean) as NormalizedChunk[];
  } else {
    chunk.siblings = [];
  }

  if (chunk.parents) {
    (chunk as unknown as NormalizedChunk).parents = chunk.parents
      .map((c) => resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id))
      .filter(Boolean) as NormalizedChunk[];
  } else {
    chunk.parents = [];
  }

  if (chunk.origins) {
    chunk.origins
      .map(
        (o) =>
          ((o as NormalizedReason).resolvedModule = o.moduleIdentifier
            ? resolveModule(o.moduleIdentifier)
            : null)
      )
      .filter(Boolean);
  } else {
    chunk.origins = [];
  }
}

function prepareChunks(
  compilation: Webpack.Compilation,
  resolvers: CompilationResolvers
): void {
  for (const chunk of compilation.chunks || []) {
    prepareChunk(chunk, resolvers);
  }
}

function prepareAssets(
  compilation: Webpack.Compilation,
  { resolveChunk }: CompilationResolvers
): void {
  for (const asset of compilation.assets || []) {
    if (asset.chunks) {
      (asset as unknown as NormalizedAsset).chunks = asset.chunks
        .map((c) =>
          resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id)
        )
        .filter(Boolean) as NormalizedChunk[];
    } else {
      asset.chunks = [];
    }

    asset.files = asset.files || [];
  }
}

function prepareEntries(
  compilation: Webpack.Compilation,
  resolveChunk: Resolver<ChunkID, NormalizedChunk>,
  resolveAsset: Resolver<string, NormalizedAsset>
): NormalizedEntrypointItem[] {
  const entrypoints: NormalizedEntrypointItem[] = [];

  for (const name in compilation.entrypoints) {
    const entry = compilation.entrypoints[name];

    if (entry.chunks) {
      (entry as NormalizedEntrypoint).chunks = entry.chunks
        .map((c) =>
          resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id)
        )
        .filter(Boolean) as NormalizedChunk[];
    }

    if (entry.assets) {
      (entry as NormalizedEntrypoint).assets = entry.assets
        .map((a) => resolveAsset(typeof a === 'string' ? a : a.name))
        .filter(Boolean) as NormalizedAsset[];
    }

    entrypoints.push({ name, data: entry as NormalizedEntrypoint });
  }

  return entrypoints;
}

function extractPackages(
  compilation: NormalizedCompilation,
  { resolvePackage, resolveExtension }: CompilationResolvers
): void {
  const buildReasonKey = (
    type: string,
    moduleIdentifier: string,
    loc: string
  ): string => {
    return [type, moduleIdentifier, loc].join(';');
  };

  const extractModulePackages = (module: NormalizedModule): void => {
    const resource = moduleResource(module);

    if (!resource) {
      return;
    }

    const modulePackage = nodeModule(resource);

    if (modulePackage) {
      let resolvedPackage = resolvePackage(modulePackage.name);

      if (!resolvedPackage) {
        resolvedPackage = { name: modulePackage.name, instances: [] };
        compilation.nodeModules.push(resolvedPackage);
      }

      let instance = resolvedPackage.instances.find(
        ({ path }) => path === modulePackage.path
      );

      if (!instance) {
        const packageInfoExt = resolveExtension(
          '@statoscope/stats-extension-package-info'
        );
        const api = packageInfoExt?.api as ExtensionPackageInfoAPI | undefined;

        const extInstance =
          api?.getInstance(compilation.hash, resolvedPackage.name, modulePackage.path) ??
          null;

        instance = {
          path: modulePackage.path,
          isRoot: modulePackage.isRoot,
          reasons: [],
          modules: [module],
          version: extInstance?.info.version,
        };
        resolvedPackage.instances.push(instance);
      } else {
        if (!instance.modules.includes(module)) {
          instance.modules.push(module);
        }
      }

      const instanceReasonsKeys = new Set(
        instance.reasons.map((reason) => {
          return buildReasonKey(
            reason.type,
            reason.data.moduleIdentifier ?? 'unknown',
            reason.data.loc ?? 'unknown'
          );
        })
      );

      for (const reason of module.reasons) {
        const reasonPackage = nodeModule(moduleReasonResource(reason));

        if (reasonPackage && reasonPackage.path === instance.path) {
          continue;
        }

        const reasonType = 'module';
        const reasonKey = buildReasonKey(
          reasonType,
          reason.moduleIdentifier ?? 'unknown',
          reason.loc ?? 'unknown'
        );

        if (!instanceReasonsKeys.has(reasonKey)) {
          instance.reasons.push({ type: reasonType, data: reason });
          instanceReasonsKeys.add(reasonKey);
        }
      }
    }
  };

  function handleModule(module: NormalizedModule): void {
    extractModulePackages(module);

    if (module.modules) {
      for (const innerModule of module.modules) {
        handleModule(innerModule);
      }
    } else {
      module.modules ??= [];
    }
  }

  for (const module of compilation.modules) {
    handleModule(module);
  }

  for (const chunk of compilation.chunks) {
    for (const module of chunk.modules) {
      handleModule(module);
    }
  }
}
