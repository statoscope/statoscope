import { Compilation } from './compilation';

export type StatsFormat = {
  name: string;
  version: string;
};

export type Stats = {
  format: StatsFormat;
  compilations: Compilation[];
};
