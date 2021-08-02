import { makeAPI } from '@statoscope/stats-validator/dist/api';
import plugin from '../..';
import statsV4 from '../../../../../test/bundles/v4/simple/stats-prod.json';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule from './';

test('matches', () => {
  const pluginInstance = plugin();
  const preparedReference = pluginInstance.prepare!([
    { name: 'reference.json', data: statsV4 },
  ]);
  const preparedAfter = pluginInstance.prepare!([{ name: 'after.json', data: statsV5 }]);
  const prepared = {
    reference: preparedReference,
    input: preparedAfter,
  };
  const api = makeAPI({ warnAsError: false });

  rule([{ name: /.+/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});

test('not matches', () => {
  const pluginInstance = plugin();
  const preparedReference = pluginInstance.prepare!([
    { name: 'reference.json', data: statsV4 },
  ]);
  const preparedAfter = pluginInstance.prepare!([{ name: 'after.json', data: statsV5 }]);
  const prepared = {
    reference: preparedReference,
    input: preparedAfter,
  };
  const api = makeAPI({ warnAsError: false });

  rule([{ name: /not_exists/ }], prepared, api);

  expect(api.getStorage()).toMatchSnapshot();
});
