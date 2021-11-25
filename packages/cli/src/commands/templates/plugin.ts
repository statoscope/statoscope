import { concatTemplateParts, templatePartsByOptions } from './templateParts';
import { FileExt, RuleTemplatesPartsFromFileExt, Template } from './types';

export const pluginTemplate: Template = (templateOptions) => {
  const plugin = templatePartsByOptions(templateOptions, {
    js: jsPlugin,
    ts: tsPlugin,
  });

  return concatTemplateParts(plugin);
};

const jsPlugin: RuleTemplatesPartsFromFileExt[FileExt.js] = {
  imports: {
    commonjs: `const asyncChunkRule = require('./rule.statoscope.js')`,
    esm: `import asyncChunkRule from './rule.statoscope.js';`,
  },
  body: `/**
  * @typedef {import('@statoscope/webpack-model').Prepared} Prepared
  * @returns {import('@statoscope/stats-validator/dist/plugin').PluginDescription<Prepared>} PluginDescription
 */
const newStatoscopePlugin = () => {
  return {
    rules: {
      "async-chunk": asyncChunkRule,
    },
  };
};`,
  exports: {
    commonjs: 'module.exports = newStatoscopePlugin',
    esm: 'export default newStatoscopePlugin',
  },
};

const tsPlugin: RuleTemplatesPartsFromFileExt[FileExt.ts] = {
  imports: `import type { PluginFn } from '@statoscope/stats-validator/dist/plugin';
import type { Prepared } from '@statoscope/webpack-model';
import asyncChunkRule from './rule.statoscope.ts';`,
  body: `
const newStatoscopePlugin: PluginFn<Prepared> = () => {
  return {
    rules: {
      "async-chunk": asyncChunkRule,
    },
  };
};`,
  exports: 'export default newStatoscopePlugin',
};
