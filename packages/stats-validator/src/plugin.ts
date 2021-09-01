import { Rule } from './rule';

export type InputFile = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type PrepareFn<TPrepared> = (files: InputFile[]) => TPrepared;
export type PluginDescription<TPrepared> = {
  prepare?: PrepareFn<TPrepared>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Record<string, Rule<any, any>>;
};

export type PluginFn<TPrepared> = () => PluginDescription<TPrepared>;
