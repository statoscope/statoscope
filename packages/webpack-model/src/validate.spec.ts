import stats from '../../../test/bundles/simple/stats-prod.json';
import validateStats from './validate';

test('should work', () => {
  expect(validateStats(stats).result).toBeTruthy();
  // @ts-ignore
  expect(validateStats(stats).errors).toBeUndefined();
  // @ts-ignore
  stats.chunks[0].modules[0].id = true;
  expect(validateStats(stats)).toMatchSnapshot();
});
