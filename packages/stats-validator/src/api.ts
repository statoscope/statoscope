import { API, Storage, RuleDescriptor } from '@statoscope/types/types/validation/api';

export function makeAPI(): API {
  let descriptor: RuleDescriptor | null = null;
  const storage: Storage = [];
  return {
    setRuleDescriptor(desc: RuleDescriptor): void {
      descriptor = desc;
    },
    getRuleDescriptor(): RuleDescriptor | null {
      return descriptor;
    },
    getStorage(): Storage {
      return storage;
    },
    message(text, options): void {
      storage.push({
        filename: options?.filename,
        compilation: options?.compilation,
        details: options?.details,
        related: options?.related,
        message: text,
      });
    },
  };
}
