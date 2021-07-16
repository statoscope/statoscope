import { ViewConfig } from '@statoscope/types';

export type Type = 'error' | 'warn' | 'info';
export type DetailsTextContent = string | string[];
export type DetailsDescriptorDiscovery<TData> = {
  type: 'discovery';
  data: TData;
  view: ViewConfig<TData, unknown>;
};
export type DetailsDescriptorTTY = { type: 'tty'; content: DetailsTextContent };
export type DetailsDescriptorText = { type: 'text'; content: DetailsTextContent };
export type DetailsDescriptor =
  | DetailsDescriptorTTY
  | DetailsDescriptorText
  | DetailsDescriptorDiscovery<unknown>;
export type Details = string | DetailsDescriptor[];
export type TestEntry = {
  type?: Type; // 'error' by default
  assert?: boolean; // false by default
  message: string;
  filename?: string;
  compilation?: string;
  details?: Details;
};
