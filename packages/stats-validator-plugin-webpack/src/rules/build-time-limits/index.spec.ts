import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import { API } from '@statoscope/types/types/validation/api';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/v5/simple/stats-prod.json';
import rule, { Params } from './';

function prepareAPI(ruleParams: Params): API {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
  ]);
  const api = makeAPI();

  rule(ruleParams, prepared, api);

  return api;
}

type Case = {
  name: string;
  params: Params;
};

const maxBuildTimeCases: Case[] = [
  {
    name: 'global',
    params: {
      global: 1,
    },
  },
  {
    name: 'not match - global',
    params: {
      global: 100000,
    },
  },
];

describe('maxBuildTime', () => {
  test.each(maxBuildTimeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});
