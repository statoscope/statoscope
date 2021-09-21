import { makeAPI } from '@statoscope/stats-validator/dist/api';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/v5/simple/stats-prod.json';
import rule from './';

test('should work', () => {
  const pluginInstance = plugin();
  const prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
  const api = makeAPI();

  rule({}, prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

describe('exclude', () => {
  test('string', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
    const api = makeAPI();

    rule({ exclude: ['bar'] }, prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('regexp', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
    const api = makeAPI();

    rule({ exclude: [/ba/] }, prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('object', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
    const api = makeAPI();

    rule({ exclude: [{ type: 'package', name: 'bar' }] }, prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('no exclude', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
    const api = makeAPI();

    rule({ exclude: [/baaaaaa/] }, prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });
});
