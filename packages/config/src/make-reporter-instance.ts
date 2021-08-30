import module from 'module';
import path from 'path';
import { ReporterConfig } from '@statoscope/types/types/validation/config';
import { Reporter } from '@statoscope/types/types/validation/reporter';
import { resolveAliasPackage } from './path';

export type ReporterConstructor<TOptions> = {
  new (options?: TOptions): Reporter;
};

export function makeReporterInstance(item: ReporterConfig, rootDir: string): Reporter {
  const [reporterPath, reporterOptions] = typeof item === 'string' ? [item] : item;
  const normalizedReporterPath = resolveAliasPackage(
    ['stats-validator-reporter', 'statoscope-stats-validator-reporter'],
    reporterPath,
    rootDir
  );
  const rootDirRequire = module.createRequire(path.join(rootDir, '_'));
  const Clazz: ReporterConstructor<unknown> | { default: ReporterConstructor<unknown> } =
    rootDirRequire(normalizedReporterPath);

  return typeof Clazz === 'function'
    ? new Clazz(reporterOptions)
    : new Clazz.default(reporterOptions);
}
