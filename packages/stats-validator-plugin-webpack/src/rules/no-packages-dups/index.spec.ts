import { makeAPI } from '@statoscope/stats-validator/dist/api';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule from './';

test('should work', () => {
  const pluginInstance = plugin();
  const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
  const api = makeAPI({ warnAsError: false });

  rule({}, prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

test('exclude', () => {
  const pluginInstance = plugin();
  const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
  const api = makeAPI({ warnAsError: false });

  rule({ exclude: ['bar'] }, prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});
