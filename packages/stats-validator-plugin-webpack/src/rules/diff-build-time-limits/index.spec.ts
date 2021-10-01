import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import { API } from '@statoscope/types/types/validation/api';
import plugin from '../..';
import referenceStats from '../../../../../test/bundles/v5/simple/stats-prod.json';
import afterStats from '../../../../../test/bundles/v4/simple/stats-dev.json';
import rule, { Params } from './';

function prepareAPI(ruleParams: Params): API {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: afterStats },
    { name: 'reference.json', data: referenceStats },
  ]);
  const api = makeAPI();

  rule(ruleParams, prepared, api);

  return api;
}

type Case = {
  name: string;
  params: Params;
};

const maxSizeCases: Case[] = [
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

describe('maxBuildTimeDiff', () => {
  test.each(maxSizeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});
