import { makeAPI } from '@statoscope/stats-validator/dist/api';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule from './';

test('matches', () => {
  const pluginInstance = plugin();
  const prepared = {
    input: pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]),
  };
  const api = makeAPI({ warnAsError: false });

  rule(['./src/index.ts'], prepared, api);
  rule([/^\.\/src/], prepared, api);

  rule([{ name: './src/index.ts' }], prepared, api);
  rule([{ name: /^\.\/src/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

test('not matches', () => {
  const pluginInstance = plugin();
  const prepared = {
    input: pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]),
  };
  const api = makeAPI({ warnAsError: false });

  rule(['./srF/index.ts'], prepared, api);
  rule([/^\.\/srF/], prepared, api);

  rule([{ name: './srF/index.ts' }], prepared, api);
  rule([{ name: /^\.\/srF/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});
