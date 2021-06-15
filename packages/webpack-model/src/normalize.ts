import md5 from 'md5';
import { StatsDescriptor } from '@statoscope/stats';
import { Extension } from '@statoscope/stats/spec/extension';
import makeEntityResolver, { Resolver } from '@statoscope/helpers/dist/entity-resolver';
import { APIFactory, Container } from '@statoscope/extensions';
import * as CompressedExtension from '@statoscope/stats-extension-compressed';
import CompressedExtensionPackage from '@statoscope/stats-extension-compressed/package.json';
import { Webpack } from '../webpack';
import validateStats, { ValidationResult } from './validate';
import { moduleReasonResource, moduleResource, nodeModule } from './module';
import ChunkID = Webpack.ChunkID;

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
};
export type NormalizedAsset = Omit<Webpack.Asset, 'chunks' | 'files'> & {
  chunks: NormalizedChunk[];
  files: Webpack.File[];
};
export type NormalizedIssuerPathItem = Webpack.IssuerPathItem & {
  resolvedModule: NormalizedModule | null;
};
export type NormalizedReason = Webpack.Reason & {
  resolvedModule: NormalizedModule | null;
};
export type NormalizedModule = Omit<Webpack.Module, 'chunks' | 'reasons' | 'modules'> & {
  resolvedResource: string | null;
  resolvedModule: NormalizedModule | null;
  issuerPath: NormalizedIssuerPathItem[];
  chunks: NormalizedChunk[];
  reasons: NormalizedReason[];
  modules: NormalizedModule[];
};
export type NormalizedPackage = {
  name: string;
  instances: NodeModuleInstance[];
};
export type NodeModuleInstance = {
  path: string;
  isRoot: boolean;
  reasons: { type: 'module'; data: NormalizedReason }[];
  modules: NormalizedModule[];
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
  __statoscope?: { descriptor: StatsDescriptor; extensions: Extension<unknown>[] };
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
  resolveExtension: Resolver<string, NormalizedExtension<unknown, unknown> | null>;
};

export type HandledCompilation = {
  data: NormalizedCompilation;
  resolvers: CompilationResolvers;
  file: NormalizedFile;
};

export type NormalizeResult = {
  files: NormalizedFile[];
  compilations: HandledCompilation[];
};

// todo: make it injectable
const extensionContainer = new Container();

extensionContainer.register(
  CompressedExtensionPackage.name,
  CompressedExtensionPackage.version,
  CompressedExtension.api as APIFactory<unknown, unknown>
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
    compilation.__statoscope?.extensions.map((ext): NormalizedExtension<
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
  const resolvePackage = makeEntityResolver(normalized.nodeModules, ({ name }) => name);
  const resolveExtension = makeEntityResolver(
    extensions,
    (ext) => ext?.data.descriptor.name
  );
  const resolvers: CompilationResolvers = {
    resolveModule,
    resolveChunk,
    resolveAsset,
    resolvePackage,
    resolveExtension,
  };

  prepareModules(compilation, resolvers);
  prepareChunks(compilation, resolvers);
  prepareAssets(compilation, resolvers);
  normalized.entrypoints = prepareEntries(compilation, resolvers);
  extractPackages(normalized, resolvers);

  return {
    data: normalized,
    resolvers,
    file,
  };
}

function makeModuleResolver(
  compilation: NormalizedCompilation
): Resolver<string, NormalizedModule> {
  const modules: NormalizedModule[] = [...compilation.modules];
  const resolve = makeEntityResolver(modules, ({ name }) => name);

  for (const chunk of compilation.chunks) {
    for (const [ix, module] of Object.entries(chunk.modules || [])) {
      const resolved = resolve(module.name);

      if (!resolved) {
        modules.push(module);
      } else {
        // @ts-ignore
        chunk.modules[ix] = module;
      }
    }
  }

  compilation.modules.length = 0;

  for (const module of [...modules]) {
    compilation.modules.push(module);
    for (const innerModule of module.modules || []) {
      modules.push(innerModule);
      compilation.modules.push(innerModule);
    }
  }

  return resolve;
}

function prepareModule(
  module: Webpack.Module | Webpack.InnerModule,
  { resolveChunk, resolveModule }: CompilationResolvers
): void {
  (module as unknown as NormalizedModule).resolvedResource = moduleResource(
    module as unknown as NormalizedModule
  );

  if (module.issuerPath) {
    module.issuerPath.map(
      (i) => ((i as NormalizedIssuerPathItem).resolvedModule = resolveModule(i.name))
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
    module.reasons = module.reasons.filter((r) => r.moduleName !== module.name);
    module.reasons.forEach(
      (r) =>
        ((r as NormalizedReason).resolvedModule = r.moduleName
          ? resolveModule(r.moduleName)
          : null)
    );
  } else {
    module.reasons = [];
  }
}

function prepareModules(
  compilation: Webpack.Compilation,
  resolvers: CompilationResolvers
): void {
  for (const module of compilation.modules || []) {
    prepareModule(module, resolvers);

    if (module.modules) {
      for (const innerModule of module.modules) {
        prepareModule(innerModule, resolvers);
      }
    }
  }
}

function prepareChunks(
  compilation: Webpack.Compilation,
  { resolveModule, resolveAsset, resolveChunk }: CompilationResolvers
): void {
  for (const chunk of compilation.chunks || []) {
    if (chunk.modules) {
      (chunk as unknown as NormalizedChunk).modules = chunk.modules
        .map((m) => resolveModule(m.name))
        .filter(Boolean) as NormalizedModule[];
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
        .map((c) =>
          resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id)
        )
        .filter(Boolean) as NormalizedChunk[];
    } else {
      chunk.children = [];
    }

    if (chunk.siblings) {
      (chunk as unknown as NormalizedChunk).siblings = chunk.siblings
        .map((c) =>
          resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id)
        )
        .filter(Boolean) as NormalizedChunk[];
    } else {
      chunk.siblings = [];
    }

    if (chunk.parents) {
      (chunk as unknown as NormalizedChunk).parents = chunk.parents
        .map((c) =>
          resolveChunk(typeof c === 'string' || typeof c === 'number' ? c : c.id)
        )
        .filter(Boolean) as NormalizedChunk[];
    } else {
      chunk.parents = [];
    }

    if (chunk.origins) {
      chunk.origins
        .map(
          (o) =>
            ((o as NormalizedReason).resolvedModule = o.moduleName
              ? resolveModule(o.moduleName)
              : null)
        )
        .filter(Boolean);
    } else {
      chunk.origins = [];
    }
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
  { resolveChunk, resolveAsset }: CompilationResolvers
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
  { resolvePackage }: CompilationResolvers
): void {
  const buildReasonKey = (type: string, moduleName: string, loc: string): string => {
    return [type, moduleName, loc].join(';');
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
        const isRoot = !modulePackage.path.match(/\/node_modules\/.+\/node_modules\//);
        instance = { path: modulePackage.path, isRoot, reasons: [], modules: [module] };
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
            reason.data.moduleName ?? 'unknown',
            reason.data.loc
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
          reason.moduleName ?? 'unknown',
          reason.loc
        );

        if (!instanceReasonsKeys.has(reasonKey)) {
          instance.reasons.push({ type: reasonType, data: reason });
          instanceReasonsKeys.add(reasonKey);
        }
      }
    }
  };

  for (const chunk of compilation.chunks) {
    for (const module of chunk.modules) {
      extractModulePackages(module);

      if (module.modules) {
        for (const innerModule of module.modules) {
          extractModulePackages(innerModule);
        }
      }
    }
  }
}
