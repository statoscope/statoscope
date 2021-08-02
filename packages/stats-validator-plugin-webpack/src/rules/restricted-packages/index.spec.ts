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

  rule(['foo'], prepared, api);
  rule(['foo@^1.0.0 || ^2.0.0'], prepared, api);

  rule([{ name: 'foo' }], prepared, api);
  rule([{ name: /^foo/ }], prepared, api);
  rule([{ name: 'foo', version: '^1.0.0 || ^2.0.0' }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

test('not matches', () => {
  const pluginInstance = plugin();
  const prepared = {
    input: pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]),
  };
  const api = makeAPI({ warnAsError: false });

  rule(['foo@^2.0.0'], prepared, api);

  rule([{ name: /^fo$/ }], prepared, api);
  rule([{ name: 'foo', version: '^2.0.0' }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});
