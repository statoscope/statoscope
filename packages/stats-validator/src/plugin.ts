import { Rule } from './rule';

export type InputFile = {
  name: string;
  data: any;
};

export type PrepareFn<TPrepared> = (files: InputFile[]) => TPrepared;
export type PluginDescription<TPrepared> = {
  prepare?: PrepareFn<TPrepared>;
  rules?: Record<string, Rule<any, any>>;
};

export type PluginFn<TPrepared> = () => PluginDescription<TPrepared>;
