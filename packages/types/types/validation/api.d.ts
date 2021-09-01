import { PackageDescriptor } from '@statoscope/stats/spec/extension';
import { Details, RelatedItem, TestEntry } from './test-entry';

export type Storage = TestEntry[];

export type APIFnOptions = {
  filename?: string;
  compilation?: string;
  details?: Details;
  related?: RelatedItem[];
};

export type RuleDescriptor = {
  description: string;
  package?: PackageDescriptor;
};

export type API = {
  setRuleDescriptor(descriptor: RuleDescriptor): void;
  getRuleDescriptor(): RuleDescriptor | null;
  message(text: string, options?: APIFnOptions): void;
  getStorage(): Storage;
};
