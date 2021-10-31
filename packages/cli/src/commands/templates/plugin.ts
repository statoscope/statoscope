import { asyncChunkRule } from './rule';

export function pluginTemplate(): string {
  return `import { PluginFn } from '@statoscope/stats-validator/dist/plugin';
  import { Rule } from '@statoscope/stats-validator/dist/rule';
  import { Prepared } from '@statoscope/webpack-model';

// Statoscope Plugin examples:
// https://github.com/statoscope/statoscope/blob/master/packages/stats-validator-plugin-webpack/src/index.ts

// How add custom plugin
// https://github.com/statoscope/statoscope/tree/master/packages/stats-validator

const newStatoscopePlugin: PluginFn<Prepared> = () => {

${asyncChunkRule}

  return {
    rules: {
      'async-chunk': asyncChunkRule,
    },
  };
};

export default newStatoscopePlugin;`;
}
