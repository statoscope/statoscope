import { FileExt } from '.';

type Options = {
  [FileExt.js]: { export?: boolean };
  [FileExt.ts]: { export?: boolean; import?: boolean };
};

export function ruleTemplate<Ft extends FileExt>(
  fileExt: Ft,
  options: Options[Ft]
): string {
  return fileExt === FileExt.ts ? asyncChunkRuleTs(options) : asyncChunkRuleJs(options);
}

const asyncChunkRuleTs = (opts: Options[FileExt.ts]): string => `${
  opts.import
    ? "import type { Rule } from '@statoscope/stats-validator/dist/rule\nimport type{ Prepared } from '@statoscope/webpack-model';\n';"
    : ''
}
type WebpackRule<TParams> = Rule<TParams, Prepared>;

type Params = string[];

const asyncChunkRule: WebpackRule<Params> = (ruleParams, data, api): void => {
  const normalizedParams: string[] = ruleParams ? ruleParams : [];
  const chunks = Array.from(new Set(...data.compilations.map((c) => c.chunks)));
  chunks
    .filter((c) =>
      c.names.some((n) => normalizedParams.includes(n) && c.initial !== false)
    )
    .forEach((f) => {
      api.message(f.names[0] + ' is not async chunk.');
    });
};
${opts.export ? '\nmodule.exports = asyncChunkRule;' : ''}`;

const asyncChunkRuleJs = (opts: Options[FileExt.js]): string => `/**
 * @typedef {import('@statoscope/types/types/validation/api').API} API
 * @typedef {import('@statoscope/webpack-model').Prepared} Prepared
 * @param  {string[]} ruleParams
 * @param  {Prepared} data
 * @param  {API} api
 * @returns void
 */
const asyncChunkRule = (ruleParams, data, api) => {

  const normalizedParams = ruleParams ? ruleParams : [];
  const chunks = Array.from(new Set(...data.compilations.map((c) => c.chunks)));
  chunks
    .filter((c) => c.names.some((n) => normalizedParams.includes(n) && c.initial !== false))
    .forEach((f) => {
      api.message(f.names[0] + " is not async chunk.");
    });
};
${opts.export ? '\nmodule.exports = asyncChunkRule;' : ''}`;
