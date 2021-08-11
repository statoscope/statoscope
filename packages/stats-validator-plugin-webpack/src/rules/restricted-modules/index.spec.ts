import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule from './';

test('matches', () => {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
  ]);
  const api = makeAPI({ warnAsError: false });

  rule(['./src/index.ts'], prepared, api);
  rule([/^\.\/src/], prepared, api);

  rule([{ name: './src/index.ts' }], prepared, api);
  rule([{ name: /^\.\/src/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

test('not matches', () => {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
  ]);
  const api = makeAPI({ warnAsError: false });

  rule(['./srF/index.ts'], prepared, api);
  rule([/^\.\/srF/], prepared, api);

  rule([{ name: './srF/index.ts' }], prepared, api);
  rule([{ name: /^\.\/srF/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});
