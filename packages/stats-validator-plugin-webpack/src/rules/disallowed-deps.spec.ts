import { makeAPI } from '@statoscope/stats-validator/dist/api';
import plugin from '../';
import statsV5 from '../../../../test/bundles/simple/stats-prod.json';
import rule from './disallowed-deps';

describe('package', () => {
  test('matches', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule(['foo'], prepared, api);
    rule(['foo@^1.0.0 || ^2.0.0'], prepared, api);

    rule([{ type: 'package', name: 'foo' }], prepared, api);
    rule([{ type: 'package', name: /^foo/ }], prepared, api);
    rule([{ type: 'package', name: 'foo', version: '^1.0.0 || ^2.0.0' }], prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('not matches', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule(['foo@^2.0.0'], prepared, api);

    rule([{ type: 'package', name: /^fo$/ }], prepared, api);
    rule([{ type: 'package', name: 'foo', version: '^2.0.0' }], prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('module', () => {
  test('matches', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule(['./src/index.ts'], prepared, api);
    rule([/^\.\/src/], prepared, api);

    rule([{ type: 'module', name: './src/index.ts' }], prepared, api);
    rule([{ type: 'module', name: /^\.\/src/ }], prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });

  test('not matches', () => {
    const pluginInstance = plugin();
    const prepared = pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]);
    const api = makeAPI({ warnAsError: false });

    rule(['./srF/index.ts'], prepared, api);
    rule([/^\.\/srF/], prepared, api);

    rule([{ type: 'module', name: './srF/index.ts' }], prepared, api);
    rule([{ type: 'module', name: /^\.\/srF/ }], prepared, api);

    expect(api.getStorage()).toMatchSnapshot();
  });
});
