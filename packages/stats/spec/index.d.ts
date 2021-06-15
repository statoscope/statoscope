import { Extension } from './extension';

export type StatsDescriptor = {
  name: string;
  version: string;
};

export type Stats = {
  descriptor: StatsDescriptor;
  extensions?: Extension<unknown>[];
};
