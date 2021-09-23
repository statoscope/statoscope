import { PackageDescriptor } from '@statoscope/stats/spec/extension';
import { RelationItem } from '..';
import { Details, TestEntry } from './test-entry';

export type Storage = TestEntry[];

export type APIFnOptions = {
  filename?: string;
  compilation?: string;
  details?: Details;
  related?: RelationItem[];
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
