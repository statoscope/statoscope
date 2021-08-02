import { makeAPI } from '@statoscope/stats-validator/dist/api';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule from './';

test('should work', () => {
  const pluginInstance = plugin();
  const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
  const api = makeAPI({ warnAsError: false });

  rule({}, { input: prepared }, api);

  expect(api.getStorage()).toMatchSnapshot();
});

describe('exclude', () => {
  test('string', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule({ exclude: ['bar'] }, { input: prepared }, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('regexp', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule({ exclude: [/ba/] }, { input: prepared }, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('object', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule({ exclude: [{ type: 'package', name: 'bar' }] }, { input: prepared }, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('no exclude', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule({ exclude: [/baaaaaa/] }, { input: prepared }, api);

    expect(api.getStorage()).toMatchSnapshot();
  });
});
