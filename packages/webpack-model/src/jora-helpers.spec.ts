import stats from '../../../test/bundles/simple/stats-prod.json';
import normalize, { NormalizedChunk } from './normalize';
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

test('statName', () => {
  const resolvedStats = helpers.resolveStat(hash);
  expect(helpers.statName(resolvedStats as ResolvedStats)).toMatch(/stats\.js \(.+?\)/);
});

test('resolveChunk', () => {
  const chunk = firstCompilation.chunks[0];
  expect(helpers.resolveChunk(chunk.id, hash)).toBe(chunk);
});
