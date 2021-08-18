import { PackageDescriptor } from '@statoscope/stats/spec/extension';
import { ViewConfig } from './';

export type Type = 'error' | 'warn' | 'info';
export type DetailsTextContent = string | string[] | (() => string | string[]);
export type DiscoveryDeserializeType =
  | {
      type: 'query';
      content: string;
    }
  | {
      type: 'function';
      content: string;
    };
export type DetailsDescriptorDiscovery = {
  type: 'discovery';
  filename: string;
  query: string;
  serialized?: {
    context?: unknown;
  };
  deserialize?: DiscoveryDeserializeType;
  view?: ViewConfig<unknown, unknown>;
};
export type DetailsDescriptorTTY = {
  type: 'tty';
  content: DetailsTextContent;
};
export type DetailsDescriptorText = {
  type: 'text';
  content: DetailsTextContent;
};
export type DetailsDescriptor =
  | DetailsDescriptorTTY
  | DetailsDescriptorText
  | DetailsDescriptorDiscovery;
export type Details = string | DetailsDescriptor[];
export type RelatedItem =
  | {
      type: 'module' | 'package' | 'package-instance' | 'resource' | 'entry';
      id: string;
    }
  | {
      type: 'chunk';
      id: string | number;
    };
export type TestEntry = {
  type?: Type; // 'error' by default
  assert?: boolean; // false by default
  message: string;
  filename?: string;
  compilation?: string;
  details?: Details;
  related?: RelatedItem[];
};

export type ValidationResultItem = {
  name: string;
  api: API;
};

export type ValidationResult = {
  rules: Array<ValidationResultItem>;
  files: {
    input: string;
    reference?: string | null;
  };
};

export type RuleResult<TData> = {
  data: TData;
  view: ViewConfig<TData, unknown>;
};

export type Storage = TestEntry[];

export type APIFnOptions = {
  filename?: string;
  compilation?: string;
  details?: Details;
  related?: RelatedItem[];
};

export type API = {
  setRuleDescriptor(descriptor: RuleDescriptor): void;
  getRuleDescriptor(): RuleDescriptor | null;
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
  warnAsError?: boolean;
};

export interface Reporter {
  run(result: ValidationResult): Promise<void>;
}

export type RuleDescriptor = {
  description: string;
  package?: PackageDescriptor;
};
