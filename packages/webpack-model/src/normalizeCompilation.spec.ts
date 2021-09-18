import stats from '../../../test/bundles/simple/stats-prod.json';
import normalize from './normalizeCompilation';

test('should work', () => {
  expect(normalize(stats)).toMatchSnapshot();
});
