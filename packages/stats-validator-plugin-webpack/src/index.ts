import { Prepared, prepareWithJora } from '@statoscope/webpack-model';
import { jora as joraHelpers } from '@statoscope/helpers';
import { RawStatsFileDescriptor } from '@statoscope/webpack-model/dist/normalize';
import { Rule } from '@statoscope/stats-validator/dist/rule';
import { PluginFn } from '@statoscope/stats-validator/dist/plugin';
import ruleDisallowedDeps from './rules/disallowed-deps';

export type WebpackRule<TParams> = Rule<TParams, Prepared>;

const webpackPlugin: PluginFn<Prepared> = () => {
  return {
    prepare(files: RawStatsFileDescriptor[]): Prepared {
      return prepareWithJora(files, { helpers: joraHelpers() });
    },
    rules: {
      'disallowed-deps': ruleDisallowedDeps,
    },
  };
};

export default webpackPlugin;
