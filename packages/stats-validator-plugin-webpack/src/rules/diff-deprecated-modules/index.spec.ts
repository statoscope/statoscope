import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import plugin from '../..';
import statsV4 from '../../../../../test/bundles/v4/simple/stats-prod.json';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule from './';

test('matches', () => {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
    { name: 'reference.json', data: statsV4 },
  ]);
  const api = makeAPI({ warnAsError: false });

  rule([{ name: /.+/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

test('not matches', () => {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
    { name: 'reference.json', data: statsV4 },
  ]);
  const api = makeAPI({ warnAsError: false });

  rule([{ name: /not_exists/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});
