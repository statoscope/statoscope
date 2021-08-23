import { Prepared, prepareWithJora } from '@statoscope/webpack-model';
import { jora as joraHelpers } from '@statoscope/helpers';
import { RawStatsFileDescriptor } from '@statoscope/webpack-model/dist/normalize';
import { Rule } from '@statoscope/stats-validator/dist/rule';
import { PluginFn } from '@statoscope/stats-validator/dist/plugin';
import diffDeprecatedModules from './rules/diff-deprecated-modules';
import diffDeprecatedPackages from './rules/diff-deprecated-packages';
import diffEntryDownloadSizeLimits from './rules/diff-entry-download-size-limits';
import diffEntryDownloadTimeLimits from './rules/diff-entry-download-time-limits';
import entryDownloadSizeLimits from './rules/entry-download-size-limits';
import entryDownloadTimeLimits from './rules/entry-download-time-limits';
import noModulesDeopts from './rules/no-modules-deopts';
import noPackagesDups from './rules/no-packages-dups';
import restrictedModules from './rules/restricted-modules';
import restrictedPackages from './rules/restricted-packages';

export type WebpackRule<TParams> = Rule<TParams, Prepared>;

const webpackPlugin: PluginFn<Prepared> = () => {
  return {
    prepare(files: RawStatsFileDescriptor[]): Prepared {
      return prepareWithJora(files, { helpers: joraHelpers() });
    },
    rules: {
      'diff-deprecated-modules': diffDeprecatedModules,
      'diff-deprecated-packages': diffDeprecatedPackages,
      'diff-entry-download-size-limits': diffEntryDownloadSizeLimits,
      'diff-entry-download-time-limits': diffEntryDownloadTimeLimits,
      'entry-download-size-limits': entryDownloadSizeLimits,
      'entry-download-time-limits': entryDownloadTimeLimits,
      'no-modules-deopts': noModulesDeopts,
      'no-packages-dups': noPackagesDups,
      'restricted-modules': restrictedModules,
      'restricted-packages': restrictedPackages,
    },
  };
};

export default webpackPlugin;
