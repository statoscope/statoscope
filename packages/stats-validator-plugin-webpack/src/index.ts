import { Prepared, prepareWithJora } from '@statoscope/webpack-model';
import { jora as joraHelpers } from '@statoscope/helpers';
import { RawStatsFileDescriptor } from '@statoscope/webpack-model/dist/normalize';
import { Rule } from '@statoscope/stats-validator/dist/rule';
import { PluginFn } from '@statoscope/stats-validator/dist/plugin';
import ruleRestrictedDeps from './rules/restricted-deps';
import ruleNoPackagesDups from './rules/no-packages-dups';

export type WebpackRule<TParams> = Rule<TParams, Prepared>;

const webpackPlugin: PluginFn<Prepared> = () => {
  return {
    prepare(files: RawStatsFileDescriptor[]): Prepared {
      return prepareWithJora(files, { helpers: joraHelpers() });
    },
    rules: {
      'restricted-deps': ruleRestrictedDeps,
      'no-package-dups': ruleNoPackagesDups,
    },
  };
};

export default webpackPlugin;
