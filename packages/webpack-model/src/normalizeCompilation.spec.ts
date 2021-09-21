import stats from '../../../test/bundles/v5/simple/stats-prod.json';
import normalize from './normalizeCompilation';

test('should work', () => {
  expect(normalize(stats)).toMatchSnapshot();
});
