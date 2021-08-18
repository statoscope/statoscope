import {
  API,
  MakeAPIParams,
  RuleDescriptor,
  Storage,
} from '@statoscope/types/types/validation';

export function makeAPI(params?: MakeAPIParams): API {
  const storage: Storage = [];
  let hasErrors = false;
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  let descriptor: RuleDescriptor | null = null;
  return {
    setRuleDescriptor(desc: RuleDescriptor): void {
      descriptor = desc;
    },
    getRuleDescriptor(): RuleDescriptor | null {
      return descriptor;
    },
    hasErrors(): boolean {
      return hasErrors;
    },
    getInfoTotal(): number {
      return infos;
    },
    getWarnTotal(): number {
      return warnings;
    },
    getErrorTotal(): number {
      return errors;
    },
    getStorage(): Storage {
      return storage;
    },
    warn(message, filenameOrOptions): void {
      if (params?.warnAsError) {
        hasErrors = true;
      }

      filenameOrOptions =
        typeof filenameOrOptions === 'string'
          ? { filename: filenameOrOptions }
          : filenameOrOptions;

      storage.push({
        type: 'warn',
        filename: filenameOrOptions?.filename,
        compilation: filenameOrOptions?.compilation,
        details: filenameOrOptions?.details,
        related: filenameOrOptions?.related,
        message,
      });
      warnings++;
    },
    error(message, filenameOrOptions): void {
      filenameOrOptions =
        typeof filenameOrOptions === 'string'
          ? { filename: filenameOrOptions }
          : filenameOrOptions;

      hasErrors = true;
      storage.push({
        type: 'error',
        filename: filenameOrOptions?.filename,
        compilation: filenameOrOptions?.compilation,
        details: filenameOrOptions?.details,
        related: filenameOrOptions?.related,
        message,
      });
      errors++;
    },
    info(message, filenameOrOptions): void {
      filenameOrOptions =
        typeof filenameOrOptions === 'string'
          ? { filename: filenameOrOptions }
          : filenameOrOptions;

      storage.push({
        type: 'info',
        filename: filenameOrOptions?.filename,
        compilation: filenameOrOptions?.compilation,
        details: filenameOrOptions?.details,
        related: filenameOrOptions?.related,
        message,
      });
      infos++;
    },
  };
}
