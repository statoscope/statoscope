import { stringify } from 'flatted';
import stats from '../../../test/bundles/simple/stats-prod.json';
import normalize from './normalize';

test('should work', () => {
  const normalized = normalize({ name: 'stats.json', data: stats });
  expect(JSON.parse(stringify(normalized))).toMatchSnapshot();
});
