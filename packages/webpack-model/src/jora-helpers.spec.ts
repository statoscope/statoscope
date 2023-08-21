import { prepareWithJora as prepareWithJoraOriginal } from '@statoscope/helpers/dist/jora';
import stats from '../../../test/bundles/v5/simple/stats-prod.json';
import { serializeSolutionPath } from '../../../test/helpers';
import {
  NormalizedAsset,
  NormalizedChunk,
  NormalizedModule,
  NormalizedModuleDependency,
  NormalizedReason,
} from '../types';
import normalize from './handleFile';
import makeHelpers, { ResolvedStats } from './jora-helpers';

const normalized = normalize({ name: 'stats.js', data: stats });
const firstFile = normalized.files[0];
let helpers: ReturnType<typeof makeHelpers>;
const prepared = prepareWithJoraOriginal(normalized.files, {
  helpers: {
    shouldExcludeResource: () => false,
    ...(helpers = makeHelpers(normalized, {
      query: (request, input, context) => prepared.query(request, input, context),
    })),
  },
});
const firstCompilation = firstFile.compilations[0];
const hash = firstCompilation.hash;

test('resolveStat', () => {
  const resolvedStats = helpers.resolveStat(hash);
  expect(resolvedStats?.file).toBe(firstFile);
  expect(resolvedStats?.compilation).toBe(firstCompilation);
});

test('resolveChunk', () => {
  const chunk = firstCompilation.chunks[0];
  expect(helpers.resolveChunk(chunk.id, hash)).toBe(chunk);
});

test('resolveAsset', () => {
  const asset = firstCompilation.assets[0];
  expect(helpers.resolveAsset(asset.name, hash)).toBe(asset);
});

test('resolveModule', () => {
  const module = firstCompilation.modules[0];
  expect(helpers.resolveModule(module.identifier, hash)).toBe(module);
});

test('resolvePackage', () => {
  const thePackage = firstCompilation.nodeModules[0];
  expect(helpers.resolvePackage(thePackage.name, hash)).toBe(thePackage);
});

test('resolveCompilation', () => {
  expect(helpers.resolveCompilation(firstCompilation.hash)).toBe(firstCompilation);
});

test('statName', () => {
  const resolvedStats = helpers.resolveStat(hash);
  expect(helpers.statName(resolvedStats as ResolvedStats)).toMatch(/stats\.js \(.+?\)/);
  expect(helpers.statName()).toBe('unknown');
});

test('getModuleSize', () => {
  const module = firstCompilation.modules[0];
  const originalModuleSize = module.size;
  expect(helpers.getModuleSize.bind(helpers, module, void 0, true)).toThrow();
  const moduleSize = helpers.getModuleSize(module, void 0, false);
  const compressedModuleSize = helpers.getModuleSize(module, hash, true);

  expect(moduleSize.size).toBe(originalModuleSize);
  expect(compressedModuleSize).not.toStrictEqual(moduleSize);
  expect(typeof compressedModuleSize.size === 'number').toBe(true);
  expect(compressedModuleSize.size).toBeGreaterThan(0);
});

test('getAssetSize', () => {
  const asset = firstCompilation.assets[0];
  const originalAssetSize = asset.size;
  expect(helpers.getAssetSize.bind(helpers, asset, void 0, true)).toThrow();
  const assetSize = helpers.getAssetSize(asset, void 0, false);
  const compressedAssetSize = helpers.getAssetSize(asset, hash, true);

  expect(assetSize.size).toBe(originalAssetSize);
  expect(compressedAssetSize).not.toStrictEqual(assetSize);
  expect(typeof compressedAssetSize.size === 'number').toBe(true);
  expect(compressedAssetSize.size).toBeGreaterThan(0);
});

test.each([
  {
    chunk: {
      id: 123,
      name: 'foo',
      names: [],
      reason: 'quux',
    },
    name: 'foo [quux]',
  },
  {
    chunk: {
      id: 123,
      name: 'foo',
      names: ['bar', 'baz'],
      reason: 'quux',
    },
    name: 'bar [quux]',
  },
  {
    chunk: {
      id: 123,
      name: 'foo',
      names: [],
      idHints: ['bar'],
      reason: 'quux',
    },
    name: 'bar [quux]',
  },

  {
    chunk: {
      id: 123,
      name: 'foo',
      names: ['foo'],
    },
    name: 'foo',
  },
  {
    chunk: {
      id: 123,
      names: ['foo'],
    },
    name: 'foo',
  },
] as Array<{ chunk: Partial<NormalizedChunk>; name: string }>)(
  'chunkName: $name',
  ({ chunk, name }) => {
    expect(helpers.chunkName(chunk as NormalizedChunk)).toBe(name);
  }
);

test.each([
  {
    asset: {
      chunkNames: [],
      chunkIdHints: [],
    },
    name: null,
  },
  {
    asset: {
      chunkNames: ['foo', 'bar'],
      chunkIdHints: [],
    },
    name: 'foo',
  },
  {
    asset: {
      chunkNames: [],
      chunkIdHints: ['bar', 'baz'],
    },
    name: 'bar',
  },
  {
    asset: {
      chunkNames: ['foo'],
      chunkIdHints: ['bar'],
    },
    name: 'foo',
  },
] as Array<{ asset: Partial<NormalizedAsset>; name: string | null }>)(
  'assetChunkName: $name',
  ({ asset, name }) => {
    expect(helpers.assetChunkName(asset as NormalizedAsset)).toBe(name);
  }
);

test('getTotalFilesSize', () => {
  expect(
    helpers.getTotalFilesSize(
      Object.assign(
        {} as NormalizedAsset,
        {
          files: [
            { name: 'one', size: 100 },
            { name: 'two', size: 50 },
          ],
        } as Partial<NormalizedAsset>
      )
    )
  ).toBe(150);
  const [asset] = firstCompilation.assets;
  const sizeA = helpers.getTotalFilesSize(asset, hash, true);
  const sizeB = helpers.getTotalFilesSize(asset, hash, false);
  expect(typeof sizeA).toBe('number');
  expect(typeof sizeB).toBe('number');
  expect(sizeA && sizeB && sizeA < sizeB).toBe(true);
  expect(helpers.getTotalFilesSize.bind(helpers, asset, void 0, true)).toThrow();
});

test('getPackageInstanceInfo', () => {
  const packageItem = firstCompilation.nodeModules.find(
    (item) => item.name === 'is-array'
  )!;
  expect(
    helpers.getPackageInstanceInfo(packageItem.name, packageItem.instances[0].path, hash)
  ).toMatchInlineSnapshot(`
    Object {
      "info": Object {
        "version": "1.0.1",
      },
      "path": "node_modules/is-array",
    }
  `);
});

test('resolveEntrypoint', () => {
  const entry = helpers.resolveEntrypoint('one', hash);
  expect(helpers.resolveEntrypoint('foooo', hash)).toBeNull();
  expect(entry).not.toBeNull();
  expect(entry).toBe(firstCompilation.entrypoints.find((e) => e.name === 'one'));
});

test('resolveFile', () => {
  expect(helpers.resolveFile('stats.js')).toBe(firstFile);
});

test('resolveExtension', () => {
  expect(helpers.resolveExtension('foo', firstFile.name)).toBeNull();
  const ext = helpers.resolveExtension(
    '@statoscope/stats-extension-compressed',
    firstFile.name
  );
  expect(ext!.data).not.toBeNull();
  expect(ext!.api).not.toBeNull();
});

test('resolveExtensionByCompilation', () => {
  expect(helpers.resolveExtensionByCompilation('foo', hash)).toBeNull();
  const ext = helpers.resolveExtensionByCompilation(
    '@statoscope/stats-extension-compressed',
    hash
  );
  expect(ext!.data).not.toBeNull();
  expect(ext!.api).not.toBeNull();
});

test('moduleGraph_getEntrypoints', () => {
  const module = firstCompilation.nodeModules.find((item) => item.name === 'is-array')!
    .instances[0].modules[0];
  const graph = helpers.getModuleGraph(hash)!;
  expect(
    helpers
      .moduleGraph_getEntrypoints(module, graph, firstCompilation.entrypoints)
      .map((entry) => entry.name)
  ).toEqual(['one', 'two']);
});

test('moduleGraph_getPaths', () => {
  const fromModule = firstCompilation.nodeModules.find(
    (item) => item.name === 'is-array'
  )!.instances[0].modules[0];
  const toModule = firstCompilation.entrypoints[0].data.dep!.module!;
  const graph = helpers.getModuleGraph(hash)!;
  const paths = helpers.moduleGraph_getPaths(fromModule, graph, toModule)!;

  expect(serializeSolutionPath(paths)).toMatchSnapshot();
});

test('modulesToFoamTree', () => {
  expect(helpers.modulesToFoamTree(firstCompilation.modules)).toMatchSnapshot();
  expect(
    helpers.modulesToFoamTree(firstCompilation.modules, hash, false)
  ).toMatchSnapshot();
  expect(
    helpers.modulesToFoamTree(firstCompilation.modules, hash, true)
  ).toMatchSnapshot();
});

describe('validation', () => {
  test('validation_getItems', () => {
    expect(helpers.validation_getItems(hash, 'entry', './src/statoscope.png')).toEqual(
      []
    );
    expect(helpers.validation_getItems(hash, 'module')).toMatchSnapshot();
    expect(helpers.validation_getItems(hash, 'module', './src/foo.png')).toEqual([]);
    expect(
      helpers.validation_getItems(hash, 'module', './src/statoscope.png')
    ).toMatchSnapshot();
  });
  test('validation_getItem', () => {
    expect(helpers.validation_getItem(100, hash)).toBeNull();
    expect(helpers.validation_getItem(0, hash)).toMatchSnapshot();
  });
  test('validation_resolveRelatedItem', () => {
    expect(
      helpers.validation_resolveRelatedItem({ id: 'foo', type: 'module' }, hash).item
    ).toBeNull();
    expect(
      helpers.validation_resolveRelatedItem(
        {
          id: 'asset/inline|./simple/src/statoscope.png',
          type: 'module',
        },
        hash
      ).item
    ).not.toBeNull();
    expect(
      helpers.validation_resolveRelatedItem(
        {
          id: 'simple/node_modules/foo',
          type: 'package-instance',
        },
        hash
        // @ts-ignore
      ).item?.path
    ).toBe('simple/node_modules/foo');
  });

  test('validation_resolveRule', () => {
    expect(helpers.validation_resolveRule('foo', hash)).toBeNull();
    expect(
      helpers.validation_resolveRule('webpack/restricted-modules', hash)
    ).toMatchSnapshot();
  });
});

describe('customReports', () => {
  test('customReports_getItems', () => {
    expect(helpers.customReports_getItems(firstFile.name)).toMatchSnapshot();
    expect(helpers.customReports_getItems(firstFile.name, hash)).toMatchSnapshot();
    expect(helpers.customReports_getItems(firstFile.name, 'foo')).toMatchSnapshot();
  });
  test('customReports_getItem', () => {
    expect(helpers.customReports_getItem('foo', firstFile.name)).toBeNull();
    expect(
      helpers.customReports_getItem('top-20-biggest-modules', firstFile.name)
    ).toMatchSnapshot();
  });
});

describe('resolverCompilationBy', () => {
  test('resolveCompilationByAsset', () => {
    expect(
      helpers.resolveCompilationByAsset(firstCompilation.assets[0], firstFile.name)
    ).toBe(firstCompilation);
  });
  test('resolveCompilationByChunk', () => {
    expect(
      helpers.resolveCompilationByChunk(firstCompilation.chunks[0], firstFile.name)
    ).toBe(firstCompilation);
  });
  test('resolveCompilationByModule', () => {
    expect(
      helpers.resolveCompilationByModule(firstCompilation.modules[0], firstFile.name)
    ).toBe(firstCompilation);
  });
  test('resolveCompilationByEntrypoint', () => {
    expect(
      helpers.resolveCompilationByEntrypoint(
        firstCompilation.entrypoints[0],
        firstFile.name
      )
    ).toBe(firstCompilation);
  });
});

describe('assets', () => {
  test('asset_getSize', () => {
    expect(helpers.asset_getSize(firstCompilation.assets[0], hash, false))
      .toMatchInlineSnapshot(`
      Object {
        "size": 9550,
      }
    `);
    expect(helpers.asset_getSize(firstCompilation.assets[0], hash, true))
      .toMatchInlineSnapshot(`
      Object {
        "compressor": "gzip",
        "meta": Object {
          "level": 6,
        },
        "size": 7141,
      }
    `);
  });
  test('assets_getTotalSize', () => {
    expect(helpers.assets_getTotalSize(firstCompilation.assets, hash, false))
      .toMatchInlineSnapshot(`
      Object {
        "compressor": undefined,
        "size": 13233,
      }
    `);
    expect(helpers.assets_getTotalSize(firstCompilation.assets, hash, true))
      .toMatchInlineSnapshot(`
      Object {
        "compressor": "gzip",
        "size": 9271,
      }
    `);
  });
});

describe('entrypoint', () => {
  test('entrypoint_getChunks', () => {
    expect(
      helpers.entrypoint_getChunks(firstCompilation.entrypoints[0]).map((c) => c.id)
    ).toEqual([666, 929, 255]);
    expect(
      helpers.entrypoint_getChunks(firstCompilation.entrypoints[1]).map((c) => c.id)
    ).toEqual([666, 929, 804, 848]);
  });
  test('entrypoint_getInitialChunks', () => {
    expect(
      helpers
        .entrypoint_getInitialChunks(firstCompilation.entrypoints[0])
        .map((c) => c.id)
    ).toEqual([666, 929, 255]);
    expect(
      helpers
        .entrypoint_getInitialChunks(firstCompilation.entrypoints[1])
        .map((c) => c.id)
    ).toEqual([666, 929, 804]);
  });
  test('entrypoint_getInitialSize', () => {
    expect(
      helpers.entrypoint_getInitialSize(firstCompilation.entrypoints[0], hash, false)
    ).toMatchInlineSnapshot(`
      Object {
        "compressor": undefined,
        "size": 3526,
      }
    `);
    expect(helpers.entrypoint_getInitialSize(firstCompilation.entrypoints[0], hash, true))
      .toMatchInlineSnapshot(`
      Object {
        "compressor": "gzip",
        "size": 1963,
      }
    `);

    expect(
      helpers.entrypoint_getInitialSize(firstCompilation.entrypoints[1], hash, false)
    ).toMatchInlineSnapshot(`
      Object {
        "compressor": undefined,
        "size": 12811,
      }
    `);
    expect(helpers.entrypoint_getInitialSize(firstCompilation.entrypoints[1], hash, true))
      .toMatchInlineSnapshot(`
      Object {
        "compressor": "gzip",
        "size": 8893,
      }
    `);
  });
  test('entrypoint_getAsyncChunks', () => {
    expect(
      helpers.entrypoint_getAsyncChunks(firstCompilation.entrypoints[0]).map((c) => c.id)
    ).toEqual([]);
    expect(
      helpers.entrypoint_getAsyncChunks(firstCompilation.entrypoints[1]).map((c) => c.id)
    ).toEqual([848]);
  });
  test('entrypoint_getAsyncSize', () => {
    expect(helpers.entrypoint_getAsyncSize(firstCompilation.entrypoints[0], hash, false))
      .toMatchInlineSnapshot(`
      Object {
        "size": 0,
      }
    `);
    expect(helpers.entrypoint_getAsyncSize(firstCompilation.entrypoints[0], hash, true))
      .toMatchInlineSnapshot(`
      Object {
        "size": 0,
      }
    `);

    expect(helpers.entrypoint_getAsyncSize(firstCompilation.entrypoints[1], hash, false))
      .toMatchInlineSnapshot(`
      Object {
        "size": 142,
      }
    `);
    expect(helpers.entrypoint_getAsyncSize(firstCompilation.entrypoints[1], hash, true))
      .toMatchInlineSnapshot(`
      Object {
        "compressor": "gzip",
        "meta": Object {
          "level": 6,
        },
        "size": 134,
      }
    `);
  });
  test('entrypoint_getAssets', () => {
    expect(
      helpers.entrypoint_getAssets(firstCompilation.entrypoints[0]).map((c) => c.name)
    ).toEqual(['runtime.js', '929.js', 'one.js']);
    expect(
      helpers.entrypoint_getAssets(firstCompilation.entrypoints[1]).map((c) => c.name)
    ).toEqual(['runtime.js', '929.js', 'two.js', '848.js']);
  });
  test('entrypoint_getInitialAssets', () => {
    expect(
      helpers
        .entrypoint_getInitialAssets(firstCompilation.entrypoints[0])
        .map((c) => c.name)
    ).toEqual(['runtime.js', '929.js', 'one.js']);
    expect(
      helpers
        .entrypoint_getInitialAssets(firstCompilation.entrypoints[1])
        .map((c) => c.name)
    ).toEqual(['runtime.js', '929.js', 'two.js']);
  });
  test('entrypoint_getAsyncAssets', () => {
    expect(
      helpers
        .entrypoint_getAsyncAssets(firstCompilation.entrypoints[0])
        .map((c) => c.name)
    ).toEqual([]);
    expect(
      helpers
        .entrypoint_getAsyncAssets(firstCompilation.entrypoints[1])
        .map((c) => c.name)
    ).toEqual(['848.js']);
  });
});

describe('module', () => {
  function handleGraph<T extends Record<string, K | true>, K extends Record<string, K>>(
    graph: T
  ): Map<string, NormalizedModule> {
    const nodeCache = new Map<string, NormalizedModule>();
    const getNode = (identifier: string): NormalizedModule => {
      let node = nodeCache.get(identifier);

      if (!node) {
        node = {
          identifier: identifier,
          deps: [],
          reasons: [],
        } as unknown as NormalizedModule;
        nodeCache.set(identifier, node);
      }

      return node;
    };

    const iteration = (obj: T | K | true, from?: string): void => {
      if (obj === true) {
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        const fromNode = from && getNode(from);

        if (fromNode) {
          const depNode = getNode(key);
          fromNode.deps?.push({ module: depNode } as NormalizedModuleDependency);
          depNode.reasons.push({ resolvedModule: fromNode } as NormalizedReason);
        }

        iteration(value, key);
      }
    };

    iteration(graph);

    return nodeCache;
  }

  it('module_uniq_retained', () => {
    const graph = handleGraph({
      preA: {
        a: true,
      },
      a: {
        b: true,
        c: {
          d: true,
          g: {
            h: true,
          },
          k: true,
        },
      },
      e: {
        f: true,
        g: true,
        l: true,
      },
    });

    expect(
      helpers
        .module_retained_modules(graph.get('a'))
        .map((n) => n.identifier)
        .sort()
    ).toEqual(['b', 'c', 'd', 'k']);

    expect(
      helpers
        .module_retained_modules(graph.get('e'))
        .map((n) => n.identifier)
        .sort()
    ).toEqual(['f', 'l']);
  });
});
