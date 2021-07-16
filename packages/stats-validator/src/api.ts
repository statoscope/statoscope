import { ViewConfig } from '@statoscope/types';
import { TestEntry, Details } from './test-entry';

export type RuleResult<TData> = {
  data: TData;
  view: ViewConfig<TData, unknown>;
};

export type Storage = TestEntry[];

export type APIFnOptions = {
  filename?: string;
  compilation?: string;
  details?: Details;
};

export type API = {
  error(message: string, filenameOrOptions?: string | APIFnOptions): void;
  warn(message: string, filenameOrOptions?: string | APIFnOptions): void;
  info(message: string, filenameOrOptions?: string | APIFnOptions): void;
  hasErrors(): boolean;
  getInfoTotal(): number;
  getWarnTotal(): number;
  getErrorTotal(): number;
  getStorage(): Storage;
};

export type MakeAPIParams = {
  warnAsError: boolean;
};

export function makeAPI(params: MakeAPIParams): API {
  const storage: Storage = [];
  let hasErrors = false;
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  return {
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
      if (params.warnAsError) {
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
        message,
      });
      infos++;
    },
  };
}
