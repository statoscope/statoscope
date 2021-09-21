import stats from '../../../test/bundles/v5/simple/stats-prod.json';
import { prepareWithJora } from './';

test('prepareWithJora', () => {
  const j = prepareWithJora({ name: 'stats.js', data: stats });
  expect(j).toMatchObject({
    files: [{ name: 'stats.js' }],
    compilations: [{ hash: stats.hash }],
  });
  expect(j.query('name')).toEqual(['stats.js']);
  expect(j.query('foo', { foo: 'bar' })).toEqual('bar');
});
