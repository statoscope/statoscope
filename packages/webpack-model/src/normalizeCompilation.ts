import { CompilationMap, ModuleData, NormalizationData, Webpack } from '../webpack';
import { collectRawModulesFromArray } from './collector';
import Compilation = Webpack.Compilation;
import Chunk = Webpack.Chunk;
import Reason = Webpack.Reason;
import RawModule = Webpack.RawModule;

function handleModule(module: RawModule, modulesData: ModuleData): number {
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
    resolvedModule!.reasons = [
      ...(resolvedModule!.reasons ?? []),
      ...(module.reasons ?? []),
    ].reduce((all, current) => {
      if (
        !all.find(
          (r) =>
            r.moduleIdentifier === current.moduleIdentifier &&
            r.type === current.type &&
            r.loc === current.loc
        )
      ) {
        all.push(current);
      }

      return all;
    }, [] as Reason[]);
  }

  return resolvedId;
}

function handleChunk(chunk: Chunk, modulesData: ModuleData): void {
  const modules = collectRawModulesFromArray(chunk.modules ?? []);

  chunk.modules = [...modules.values()];

  for (const [id, module] of chunk.modules.entries()) {
    // @ts-ignore
    chunk.modules![id] = handleModule(module, modulesData);
  }
}

function handleCompilation(
  compilation: Compilation,
  compilationMap: CompilationMap
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
