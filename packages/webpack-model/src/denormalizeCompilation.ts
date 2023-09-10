import { NormalizationData, type Webpack } from '../webpack';

export type ModulesMap = Map<number, Webpack.RawModule>;

export type CompilationData = {
  id: string;
  data: {
    modules: ModulesMap;
  };
};

export type DenormalizationData = {
  links: NormalizationData['links'];
  data: {
    compilations: CompilationData[];
  };
};

function handleModule(
  module: number,
  compilationData: CompilationData,
): Webpack.RawModule {
  const resolvedModule = compilationData.data.modules.get(module);

  if (!resolvedModule) {
    throw new Error(`Can't resolve module ${module}`);
  }

  return resolvedModule;
}

function handleChunk(chunk: Webpack.Chunk, compilationData: CompilationData): void {
  for (const [id, module] of (
    (chunk.modules as Array<number | Webpack.Module>) || []
  ).entries()) {
    if (typeof module === 'number') {
      chunk.modules![id] = handleModule(module, compilationData);
    }
  }
}

function handleCompilation(
  compilation: Webpack.Compilation,
  denormalizationData: DenormalizationData,
): void {
  const compilationData = denormalizationData.data.compilations.find(
    (c) => c.id === (compilation.hash || compilation.name),
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

export default function denormalizeCompilation<T extends Webpack.Compilation>(
  json: T,
): T {
  if (!json.__statoscope?.normalization) {
    return json;
  }

  const denormalizationData: DenormalizationData = {
    links: json.__statoscope.normalization.links,
    data: {
      compilations: json.__statoscope.normalization.data.compilations.map(
        (compilation) => {
          return {
            id: compilation.id,
            data: {
              modules: new Map(compilation.data.modules),
            },
          };
        },
      ),
    },
  };

  const compilations: Webpack.Compilation[] = [json];
  let cursor: Webpack.Compilation | undefined;

  while ((cursor = compilations.pop())) {
    handleCompilation(cursor, denormalizationData);

    for (const child of cursor.children || []) {
      compilations.push(child);
    }
  }

  // @ts-ignore
  delete json.__statoscope?.normalization;

  return json;
}
