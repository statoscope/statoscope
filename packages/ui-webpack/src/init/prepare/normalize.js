import validateStats from '../../validate';
import moduleResource, { moduleReasonResource, nodeModule } from './module';
import { makeEntityResolver } from './entity';

export default function normalize(statObject) {
  const file = {
    name: statObject.name,
    version: statObject.data.version,
    validation: validateStats(statObject.data),
    compilations: [],
  };

  if (!statObject.data.chunks && statObject.data.children) {
    for (const child of statObject.data.children) {
      file.compilations.push(
        handleCompilation({
          name: child.name,
          builtAt: child.builtAt,
          time: child.time,
          hash: child.hash,
          entrypoints: child.entrypoints || [],
          chunks: child.chunks || [],
          assets: child.assets || [],
          nodeModules: [],
        })
      );
    }
  } else {
    file.compilations.push(
      handleCompilation({
        time: statObject.data.time,
        builtAt: statObject.data.builtAt,
        name: statObject.data.name,
        hash: statObject.data.hash,
        entrypoints: statObject.data.entrypoints || [],
        chunks: statObject.data.chunks || [],
        assets: statObject.data.assets || [],
        nodeModules: [],
      })
    );
  }

  return file;
}

function handleCompilation(compilation) {
  const resolveModule = makeModuleResolver(compilation);
  const resolveChunk = makeEntityResolver(compilation.chunks, ({ id }) => id);
  const resolveAsset = makeEntityResolver(compilation.assets, ({ name }) => name);
  const resolvePackage = makeEntityResolver(compilation.nodeModules, ({ name }) => name);
  const resolvers = {
    resolveModule,
    resolveChunk,
    resolveAsset,
    resolvePackage,
  };

  prepareModules(compilation, resolvers);
  prepareChunks(compilation, resolvers);
  prepareAssets(compilation, resolvers);
  prepareEntries(compilation, resolvers);
  extractPackages(compilation, resolvers);

  return {
    data: compilation,
    resolvers,
  };
}

function makeModuleResolver(compilation) {
  const modulesMap = new Map();

  for (const chunk of compilation.chunks) {
    if (!chunk.modules) {
      continue;
    }

    for (const module of chunk.modules) {
      modulesMap.set(module.identifier, module);
    }
  }

  compilation.modules = [...modulesMap.values()];

  for (const [, module] of modulesMap) {
    if (!module.modules) {
      continue;
    }

    for (const innerModule of module.modules) {
      modulesMap.set(innerModule.identifier, innerModule);
    }
  }

  const modules = [...modulesMap.values()];

  return makeEntityResolver(modules, ({ identifier }) => identifier);
}

function prepareModule(module, { resolveChunk, resolveModule }) {
  module.resolvedResource = moduleResource(module);

  if (module.issuerPath) {
    module.issuerPath.map((i) => (i.resolvedModule = resolveModule(i.identifier)));
  }

  if (module.chunks) {
    module.chunks = module.chunks.map((c) => resolveChunk(c)).filter(Boolean);
  } else {
    module.chunks = [];
  }

  if (module.reasons) {
    module.reasons.map((r) => (r.resolvedModule = resolveModule(r.moduleIdentifier)));
  } else {
    module.reasons = [];
  }
}

function prepareModules(compilation, resolvers) {
  for (const module of compilation.modules) {
    prepareModule(module, resolvers);

    if (module.modules) {
      for (const innerModule of module.modules) {
        prepareModule(innerModule, resolvers);
      }
    }
  }
}

function prepareChunks(compilation, { resolveModule, resolveAsset, resolveChunk }) {
  for (const chunk of compilation.chunks) {
    if (chunk.modules) {
      chunk.modules = chunk.modules
        .map((m) => resolveModule(m.identifier))
        .filter(Boolean);
    } else {
      chunk.modules = [];
    }

    if (chunk.files) {
      chunk.files = chunk.files.map((f) => resolveAsset(f)).filter(Boolean);
    } else {
      chunk.files = [];
    }

    if (chunk.children) {
      chunk.children = chunk.children.map((c) => resolveChunk(c)).filter(Boolean);
    } else {
      chunk.children = [];
    }

    if (chunk.siblings) {
      chunk.siblings = chunk.siblings.map((c) => resolveChunk(c)).filter(Boolean);
    } else {
      chunk.siblings = [];
    }

    if (chunk.parents) {
      chunk.parents = chunk.parents.map((c) => resolveChunk(c)).filter(Boolean);
    } else {
      chunk.parents = [];
    }

    if (chunk.origins) {
      chunk.origins.map((o) => (o.resolvedModule = resolveModule(o.moduleIdentifier)));
    } else {
      chunk.origins = [];
    }
  }
}

function prepareAssets(compilation, { resolveChunk }) {
  for (const asset of compilation.assets) {
    if (asset.chunks) {
      asset.chunks = asset.chunks.map((c) => resolveChunk(c)).filter(Boolean);
    }
  }
}

function prepareEntries(compilation, { resolveChunk, resolveAsset }) {
  const entrypoints = [];

  for (const name in compilation.entrypoints) {
    const entry = compilation.entrypoints[name];

    if (entry.chunks) {
      entry.chunks = entry.chunks.map((c) => resolveChunk(c)).filter(Boolean);
    }

    if (entry.assets) {
      entry.assets = entry.assets.map((a) => resolveAsset(a)).filter(Boolean);
    }

    entrypoints.push({ name, data: entry });
  }

  compilation.entrypoints = entrypoints;
}

function extractPackages(compilation, { resolvePackage }) {
  const buildReasonKey = (type, moduleIdentifier, loc) => {
    return [type, moduleIdentifier, loc].join(';');
  };

  const extractModulePackages = (module) => {
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
            reason.data.moduleIdentifier,
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
        const reasonKey = buildReasonKey(reasonType, reason.moduleIdentifier, reason.loc);

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
