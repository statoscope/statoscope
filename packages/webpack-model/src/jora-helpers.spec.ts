import stats from '../../../test/bundles/simple/stats-prod.json';
import normalize, { NormalizedAsset, NormalizedChunk } from './normalize';
import makeHelpers, { ResolvedStats } from './jora-helpers';

const normalized = normalize({ name: 'stats.js', data: stats });
const firstFile = normalized.files[0];
const helpers = makeHelpers(normalized.compilations, normalized.files);
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

test('moduleSize', () => {
  const module = firstCompilation.modules[0];
  const size = helpers.moduleSize(module);
  expect(typeof size === 'number').toBe(true);
  expect(size).toBeGreaterThan(0);
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
});
