import { ViewConfig } from '@statoscope/types';

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
