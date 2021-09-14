import { SerializationData, Webpack } from '../webpack';
import Compilation = Webpack.Compilation;
import Module = Webpack.Module;
import Chunk = Webpack.Chunk;

export type ModulesMap = Map<number, Module>;

export type CompilationData = {
  id: string;
  data: {
    modules: ModulesMap;
  };
};

export type DeserializationData = {
  links: SerializationData['links'];
  data: {
    compilations: CompilationData[];
  };
};

function handleModule(module: number, compilationData: CompilationData): Module {
  const resolvedModule = compilationData.data.modules.get(module);

  if (!resolvedModule) {
    throw new Error(`Can't resolve module ${module}`);
  }

  return resolvedModule;
}

function handleChunk(chunk: Chunk, compilationData: CompilationData): void {
  for (const [id, module] of (chunk.modules || []).entries()) {
    if (typeof module === 'number') {
      chunk.modules![id] = handleModule(module, compilationData);
    }
  }
}

function handleCompilation(
  compilation: Compilation,
  deserializationData: DeserializationData
): void {
  const compilationData = deserializationData.data.compilations.find(
    (c) => c.id === (compilation.hash || compilation.name)
  );

  if (!compilationData) {
    return;
  }

  for (const [id, module] of (compilation.modules || []).entries()) {
    if (typeof module === 'number') {
      compilation.modules![id] = handleModule(module, compilationData);
    }
  }

  for (const chunk of compilation.chunks || []) {
    handleChunk(chunk, compilationData);
  }
}

export default function deserialize<T extends Compilation>(json: T): T {
  if (!json.__statoscope?.serialization) {
    return json;
  }

  const deserializationData: DeserializationData = {
    links: json.__statoscope.serialization.links,
    data: {
      compilations: json.__statoscope.serialization.data.compilations.map(
        (compilation) => {
          return {
            id: compilation.id,
            data: {
              modules: new Map(compilation.data.modules),
            },
          };
        }
      ),
    },
  };

  const compilations: Compilation[] = [json];
  let cursor: Compilation | undefined;

  while ((cursor = compilations.pop())) {
    handleCompilation(cursor, deserializationData);

    for (const child of cursor.children || []) {
      compilations.push(child);
    }
  }

  // @ts-ignore
  delete json.__statoscope?.serialization;

  return json;
}