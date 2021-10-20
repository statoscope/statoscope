import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { PluginDescription } from '@statoscope/stats-validator/dist/plugin';
import { API } from '@statoscope/types/types/validation/api';
import { Prepared } from '@statoscope/webpack-model';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/v5/simple/stats-prod.json';
import { PackageTarget } from '../../helpers';
import rule from './';

const targetDescription = 'Completely valid reason not to use foo';

describe('basic functionality', () => {
  let pluginInstance!: PluginDescription<Prepared>;
  let prepared!: Prepared;
  let api!: API;

  beforeEach(() => {
    pluginInstance = plugin();
    prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
    api = makeAPI();
  });

  const matchTargets: (string | PackageTarget)[] = [
    'foo',
    'foo@^1.0.0 || ^2.0.0',
    { name: 'foo' },
    { name: 'foo', description: targetDescription },
    { name: /^foo/ },
    { name: 'foo', version: '^1.0.0 || ^2.0.0' },
    { name: 'foo', version: '^1.0.0 || ^2.0.0', description: targetDescription },
  ];

  matchTargets.forEach((matchRule) => {
    test(`match test`, () => {
      rule([matchRule], prepared, api);
      expect(api.getStorage()).toMatchSnapshot();
    });
  });

  const noMatchTargets: (PackageTarget | string)[] = [
    'foo@^2.0.0',
    { name: /^fo$/ },
    { name: 'foo', version: '^2.0.0' },
    { name: 'foo', version: '^2.0.0', description: "which doesn't matter" },
    { name: 'foo', version: '^2.0.0', alternatives: ['bar'] },
  ];

  noMatchTargets.forEach((nonMatchRule) => {
    test(`does not match test`, () => {
      rule([nonMatchRule], prepared, api);

      expect(api.getStorage()).toMatchSnapshot();
    });
  });
});

describe('Alternative packages support', () => {
  let pluginInstance!: PluginDescription<Prepared>;
  let prepared!: Prepared;
  let api!: API;

  beforeEach(() => {
    pluginInstance = plugin();
    prepared = pluginInstance.prepare!([{ name: 'input.json', data: statsV5 }]);
    api = makeAPI();
  });

  it('renders the list of alternative packages when provided', () => {
    const matchTargets: (PackageTarget | string)[] = [
      { name: 'foo', alternatives: ['bar'] },
      { name: 'foo', alternatives: ['bar', 'bar2'], description: targetDescription },
      { name: /^foo/, alternatives: ['bar'] },
    ];

    matchTargets.forEach((matchRule) => {
      rule([matchRule], prepared, api);
      expect(api.getStorage()).toMatchSnapshot();
    });
  });

  it("doesn't render the list when alternatives aren't provided", () => {
    const matchWoAlternativesTargets: (PackageTarget | string)[] = [
      { name: 'foo' },
      { name: 'foo', alternatives: [] },
    ];

    matchWoAlternativesTargets.forEach((matchRule) => {
      rule([matchRule], prepared, api);
      expect(api.getStorage()).toMatchSnapshot();
    });
  });
});
