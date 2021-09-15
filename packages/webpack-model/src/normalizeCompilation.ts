import { CompilationMap, ModuleData, NormalizationData, Webpack } from '../webpack';
import Module = Webpack.Module;
import Compilation = Webpack.Compilation;
import Chunk = Webpack.Chunk;

function handleModule(module: Module, modulesData: ModuleData): number {
  let resolvedId = modulesData.nameToIdMap.get(module.name);

  if (!resolvedId) {
    resolvedId = modulesData.lastId++;
    modulesData.nameToIdMap.set(module.name, resolvedId);
    modulesData.idToModuleMap.set(resolvedId, module);
  } else {
    const resolvedModule = modulesData.idToModuleMap.get(resolvedId);
    resolvedModule!.chunks = [...new Set([...resolvedModule!.chunks, ...module.chunks])];
  }

  return resolvedId;
}

function handleChunk(chunk: Chunk, modulesData: ModuleData): void {
  for (const [id, module] of (chunk.modules || []).entries()) {
    // @ts-ignore
    chunk.modules![id] = handleModule(module, modulesData);
  }
}

function handleCompilation(
  compilation: Compilation,
  compilationMap: CompilationMap
): void {
  const modulesData: ModuleData = {
    idToModuleMap: new Map(),
    nameToIdMap: new Map(),
    lastId: 1,
  };

  compilationMap.set((compilation.hash || compilation.name)!, {
    modules: modulesData,
  });

  for (const [id, module] of (compilation.modules || []).entries()) {
    // @ts-ignore
    compilation.modules![id] = handleModule(module, modulesData);
  }

  for (const chunk of compilation.chunks || []) {
    handleChunk(chunk, modulesData);
  }
}

export default function normalizeCompilation<T extends Record<string, unknown>>(
  json: T
): T {
  const compilationMap: CompilationMap = new Map();
  const compilations: Compilation[] = [json];
  let cursor: Compilation | undefined;

  while ((cursor = compilations.pop())) {
    handleCompilation(cursor, compilationMap);

    for (const child of cursor.children || []) {
      compilations.push(child);
    }
  }

  const normalizationData: NormalizationData = {
    links: { modules: ['chunks'] },
    data: {
      compilations: [...compilationMap.entries()].map(([id, compilation]) => {
        return {
          id,
          data: {
            modules: [...compilation.modules.idToModuleMap.entries()],
          },
        };
      }),
    },
  };

  // @ts-ignore
  json.__statoscope = json.__statoscope || {};
  // @ts-ignore
  json.__statoscope.normalization = normalizationData;

  return json;
}
