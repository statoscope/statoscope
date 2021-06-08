import stats from '../../../test/bundles/simple/stats-prod.json';

test('should work', () => {
  // @ts-ignore
  delete stats.time;
  // @ts-ignore
  delete stats.builtAt;
  expect(1).toBe(1);
});
