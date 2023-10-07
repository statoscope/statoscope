import { CompilationMap, ModuleData, NormalizationData, type Webpack } from '../webpack';
import { collectRawModulesFromArray, collectRawReasonsFromArray } from './collector';

function handleModule(module: Webpack.RawModule, modulesData: ModuleData): number {
  let resolvedId = modulesData.idToIxMap.get(module.identifier);

  if (!resolvedId) {
    resolvedId = modulesData.lastId++;
    modulesData.idToIxMap.set(module.identifier, resolvedId);
    modulesData.ixToModuleMap.set(resolvedId, module);
  } else {
    const resolvedModule = modulesData.ixToModuleMap.get(resolvedId);
    resolvedModule!.chunks = [
      ...new Set([...(resolvedModule!.chunks ?? []), ...(module.chunks ?? [])]),
    ];
    const toReasons = collectRawReasonsFromArray(resolvedModule!.reasons ?? []);
    const fromReasons = collectRawReasonsFromArray(module.reasons ?? []);
    const reasonMap = new Map<string, Webpack.RawReason>();

    for (const current of [...toReasons.values(), ...fromReasons.values()]) {
      const key = `${current.moduleIdentifier}-${current.type}-${current.loc}`;

      if (!reasonMap.has(key)) {
        reasonMap.set(key, current);
      }
    }

    resolvedModule!.reasons = [...reasonMap.values()];
  }

  return resolvedId;
}

function handleChunk(chunk: Webpack.Chunk, modulesData: ModuleData): void {
  const modules = collectRawModulesFromArray(chunk.modules ?? []);

  chunk.modules = [...modules.values()];

  for (const [id, module] of chunk.modules.entries()) {
    // @ts-ignore
    chunk.modules![id] = handleModule(module, modulesData);
  }
}

function handleCompilation(
  compilation: Webpack.Compilation,
  compilationMap: CompilationMap,
): void {
  const modulesData: ModuleData = {
    ixToModuleMap: new Map(),
    idToIxMap: new Map(),
    lastId: 1,
  };

  compilationMap.set((compilation.hash || compilation.name)!, {
    modules: modulesData,
  });

  const modules = collectRawModulesFromArray(compilation.modules ?? []);

  compilation.modules = [...modules.values()];

  for (const [id, module] of compilation.modules.entries()) {
    // @ts-ignore
    compilation.modules![id] = handleModule(module, modulesData);
  }

  for (const chunk of compilation.chunks || []) {
    handleChunk(chunk, modulesData);
  }
}

export default function normalizeCompilation<T extends Record<string, unknown>>(
  json: T,
): T {
  // @ts-ignore
  if (json.__statoscope?.normalization) {
    return json;
  }

  const compilationMap: CompilationMap = new Map();
  const compilations: Webpack.Compilation[] = [json];
  let cursor: Webpack.Compilation | undefined;

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
            modules: [...compilation.modules.ixToModuleMap.entries()],
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
