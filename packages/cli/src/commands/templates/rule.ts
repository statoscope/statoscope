import { concatTemplateParts, templatePartsByOptions } from './templateParts';
import { FileExt, RuleTemplatesPartsFromFileExt, Template } from './types';

export const ruleTemplate: Template = (templateOptions) => {
  const rule = templatePartsByOptions(templateOptions, {
    js: jsRule,
    ts: tsRule,
  });

  return concatTemplateParts(rule);
};

const jsRuleBody = `/**
* @typedef {import('@statoscope/types/types/validation/api').API} API
* @typedef {import('@statoscope/webpack-model').Prepared} Prepared
* @param  {string[]} ruleParams
* @param  {Prepared} data
* @param  {API} api
* @returns void
*/
const asyncChunkRule = (ruleParams, data, api) => {
  const normalizedParams = ruleParams ? ruleParams : [];
  // we can use jora-queries in rules
  // const chunks = data.query('compilations.chunks');
  const chunks = [...new Set(data.compilations.map((c) => c.chunks).flat())];

  chunks
    .filter((c) => c.names.some((n) => normalizedParams.includes(n) && c.initial))
    .forEach((f) => {
      api.message('Chunk ' + f.names[0] + ' should be async.',{
         compilation:data.compilations[0].hash,
         filename:"All build files"
      });
    });
};`;

const jsRule: RuleTemplatesPartsFromFileExt[FileExt.js] = {
  imports: {
    commonjs: '',
    esm: '',
  },
  body: jsRuleBody,
  exports: {
    commonjs: 'module.exports = asyncChunkRule;',
    esm: 'export default asyncChunkRule',
  },
};

const tsRuleBody = `type WebpackRule<TParams> = Rule<TParams, Prepared>;
type Params = string[];

const asyncChunkRule: WebpackRule<Params> = (ruleParams, data, api): void => {
  const normalizedParams: string[] = ruleParams ? ruleParams : [];
  // we can use jora-queries in rules
  // const chunks = data.query('compilations.chunks');
  const chunks = [...new Set(data.compilations.map((c) => c.chunks).flat())];

  chunks
    .filter((c) =>
      c.names.some((n) => normalizedParams.includes(n) && c.initial)
    )
    .forEach((f) => {
      api.message('Chunk ' + f.names[0] + ' should be async.',{
         compilation:data.compilations[0].hash,
         filename:"All build files"
      });
    });
};`;

const tsRule: RuleTemplatesPartsFromFileExt[FileExt.ts] = {
  imports: `import type { Rule } from "@statoscope/stats-validator/dist/rule";
import type { Prepared } from "@statoscope/webpack-model";`,
  body: tsRuleBody,
  exports: 'export default asyncChunkRule;',
};
