export function ruleTemplate(): string {
  return `import { Rule } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';

//Statoscope Plugins examples:
https://github.com/statoscope/statoscope/tree/c9d0c148c1e38a87696d79485f37e598110db80c/packages/stats-validator-plugin-webpack#rules


${asyncChunkRule}

export default asyncChunkRule;`;
}

export const asyncChunkRule = `
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
};`;
