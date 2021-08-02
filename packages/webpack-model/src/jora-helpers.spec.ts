import { PathSolution } from '@statoscope/helpers/dist/graph';
import stats from '../../../test/bundles/simple/stats-prod.json';
import normalize, {
  ModuleGraphNodeData,
  NormalizedAsset,
  NormalizedChunk,
} from './normalize';
import makeHelpers, { ResolvedStats } from './jora-helpers';

const normalized = normalize({ name: 'stats.js', data: stats });
const firstFile = normalized.files[0];
const helpers = makeHelpers(normalized.compilations);
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
  expect(helpers.resolveModule(module.name, hash)).toBe(module);
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
    name: 'bar, baz [quux]',
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
      "path": "../node_modules/is-array",
    }
  `);
});

test('moduleGraph_getEntrypoints', () => {
  const module = firstCompilation.nodeModules.find((item) => item.name === 'is-array')!
    .instances[0].modules[0];
  const graph = helpers.getModuleGraph(hash)!;
  expect(
    helpers
      .moduleGraph_getEntrypoints(module, graph, firstCompilation.entrypoints)
      .map((entry) => entry.name)
  ).toMatchInlineSnapshot(`
    Array [
      "one",
      "two",
    ]
  `);
});

// eslint-disable-next-line @typescript-eslint/ban-types
function serializeSolutionPath(solution: PathSolution<ModuleGraphNodeData>): object {
  return {
    node: {
      id: solution.node.id,
    },
    children: solution.children.map(serializeSolutionPath),
  };
}

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
