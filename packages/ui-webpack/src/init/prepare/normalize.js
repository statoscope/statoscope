import md5 from 'md5';
import validateStats from '../../validate';
import moduleResource, { moduleReasonResource, nodeModule } from './module';
import { makeEntityResolver } from './entity';

function prepareCompilation(compilation, parent) {
  return {
    time: compilation.time,
    builtAt: compilation.builtAt,
    name: compilation.name,
    hash: compilation.hash || md5(compilation.hash + compilation.name),
    entrypoints: compilation.entrypoints || [],
    chunks: compilation.chunks || [],
    assets: compilation.assets || [],
    nodeModules: [],
    children: (compilation.children || []).map((child) =>
      prepareCompilation(child, compilation)
    ),
    ...(parent && { isChild: true, parent: parent.hash }),
  };
}

export default function normalize(statObject) {
  const file = {
    name: statObject.name,
    version: statObject.data.version,
    validation: validateStats(statObject.data),
    compilations: [],
  };

  const stack = [prepareCompilation(statObject.data)];
  let cursor;

  while ((cursor = stack.pop())) {
    file.compilations.push(handleCompilation(cursor));

    for (const child of cursor.children) {
      stack.push(child);
    }
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
      modulesMap.set(module.name, module);
    }
  }

  if (compilation.modules?.length) {
    for (const module of compilation.modules) {
      if (!modulesMap.has(module.name)) {
        modulesMap.set(module.name, module);
      }
    }
  }

  compilation.modules = [...modulesMap.values()];

  for (const [, module] of modulesMap) {
    if (!module.modules) {
      continue;
    }

    for (const innerModule of module.modules) {
      modulesMap.set(innerModule.name, innerModule);
    }
  }

  const modules = [...modulesMap.values()];

  return makeEntityResolver(modules, ({ name }) => name);
}

function prepareModule(module, { resolveChunk, resolveModule }) {
  module.resolvedResource = moduleResource(module);

  if (module.issuerPath) {
    module.issuerPath.map((i) => (i.resolvedModule = resolveModule(i.name)));
  }

  if (module.chunks) {
    module.chunks = module.chunks.map((c) => resolveChunk(c)).filter(Boolean);
  } else {
    module.chunks = [];
  }

  if (module.reasons) {
    module.reasons = module.reasons.filter(
      (r) => r.moduleName !== module.name
    );
    module.reasons.forEach((r) => (r.resolvedModule = resolveModule(r.moduleName)));
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
        .map((m) => resolveModule(m.name))
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
      chunk.origins.map((o) => (o.resolvedModule = resolveModule(o.moduleName)));
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
  const buildReasonKey = (type, moduleName, loc) => {
    return [type, moduleName, loc].join(';');
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
            reason.data.moduleName,
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
        const reasonKey = buildReasonKey(reasonType, reason.moduleName, reason.loc);

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
