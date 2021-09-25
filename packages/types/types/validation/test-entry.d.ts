import { RelationItem, ViewConfig } from '../';

export type DetailsTextContent = string | string[] | (() => string | string[]);
export type DiscoveryDeserializeType = {
  type: 'query';
  content: string;
};
export type DetailsDescriptorDiscovery = {
  type: 'discovery';
  query: string;
  payload?: {
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

export type TestEntry = {
  message: string;
  filename?: string;
  compilation?: string;
  details?: Details;
  related?: RelationItem[];
};
