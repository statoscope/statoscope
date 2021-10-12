import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { PluginDescription } from '@statoscope/stats-validator/dist/plugin';
import { API } from '@statoscope/types/types/validation/api';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/v5/simple/stats-prod.json';
import rule from './';

describe('basic functionality', () => {
  let pluginInstance!: PluginDescription<any>;
  let prepared!: any;
  let api!: API;

  beforeEach(() => {
    pluginInstance = plugin();
    prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
    api = makeAPI();
  });

  const matchRules = [
    'foo',
    'foo@^1.0.0 || ^2.0.0',
    { name: 'foo' },
    { name: /^foo/ },
    { name: 'foo', version: '^1.0.0 || ^2.0.0' },
  ];

  matchRules.forEach((matchRule) => {
    test(`match test`, () => {
      rule([matchRule], prepared, api);
      expect(api.getStorage()).toMatchSnapshot();
    });
  });

  const nonMatchRules = [
    'foo@^2.0.0',
    { name: /^fo$/ },
    { name: 'foo', version: '^2.0.0' },
  ];

  nonMatchRules.forEach((nonMatchRule) => {
    test(`does not match test`, () => {
      rule([nonMatchRule], prepared, api);

      expect(api.getStorage()).toMatchSnapshot();
    });
  });
});
