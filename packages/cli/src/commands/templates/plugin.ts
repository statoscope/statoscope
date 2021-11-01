import { ruleTemplate } from './rule';
import { FileExt } from '.';

export function pluginTemplate(fileExt: FileExt): string {
  return fileExt === FileExt.ts ? asyncChunkRulePluginTs : asyncChunkRulePluginJs;
}

export const asyncChunkRulePluginTs = `import type{ PluginFn } from '@statoscope/stats-validator/dist/plugin';
import type{ Rule } from '@statoscope/stats-validator/dist/rule';
import type{ Prepared } from '@statoscope/webpack-model';

${ruleTemplate(FileExt.ts, {
  export: false,
  import: false,
})}
const newStatoscopePlugin: PluginFn<Prepared> = () => {
  return {
    rules: {
      'async-chunk': asyncChunkRule,
    },
  };
};

module.exports = newStatoscopePlugin;`;

export const asyncChunkRulePluginJs = `${ruleTemplate(FileExt.js, {
  export: false,
})}
const newStatoscopePlugin = () => {
  return {
    rules: {
      "async-chunk": asyncChunkRule,
    },
  };
};

module.exports = newStatoscopePlugin;`;
