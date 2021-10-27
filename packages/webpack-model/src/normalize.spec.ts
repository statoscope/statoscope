import { stringify } from 'flatted';
import stats from '../../../test/bundles/v5/simple/stats-prod.json';
import normalize from './handleFile';

test('should work', () => {
  // @ts-ignore
  delete stats.time;
  // @ts-ignore
  delete stats.builtAt;
  const normalized = normalize({ name: 'stats.json', data: stats });
  expect(JSON.parse(stringify(normalized))).toMatchSnapshot();
});
