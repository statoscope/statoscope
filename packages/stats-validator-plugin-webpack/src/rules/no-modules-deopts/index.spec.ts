import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/v5/simple/stats-prod.json';
import rule from './';

test('matches', () => {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
  ]);
  const api = makeAPI();

  rule(null, prepared, api);
  rule(null, prepared, api);

  rule(null, prepared, api);
  rule(null, prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

test('not matches', () => {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
  ]);
  const api = makeAPI();

  rule({ exclude: [/.+/] }, prepared, api);
  rule({ exclude: [/.+/] }, prepared, api);

  rule({ exclude: [/.+/] }, prepared, api);
  rule({ exclude: [/.+/] }, prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});
