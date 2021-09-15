import stats from '../../../test/bundles/simple/stats-prod.json';
import normalize from './normalizeCompilation';
import denormalize from './denormalizeCompilation';

test('should work', () => {
  expect(denormalize(normalize(stats))).toMatchSnapshot();
});
