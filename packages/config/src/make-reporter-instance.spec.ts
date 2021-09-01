import path from 'path';
import { makeReporterInstance } from './make-reporter-instance';

const fixtureDir = path.resolve(__filename, '../../../../test/fixtures/config');

test('should work', async () => {
  const instance = makeReporterInstance(['@statoscope/1', { foo: 'bar' }], fixtureDir);

  await instance.run({
    rules: [],
    files: {
      input: '',
    },
  });

  // @ts-ignore
  expect(instance.config.foo).toBe('bar');
});
