import { RuleDesc } from './rule';

export type ReporterConfig = string | [string, unknown];
export type Config = {
  plugins?: Array<string | [string, string]>;
  silent?: boolean;
  reporters?: ReporterConfig[];
  rules: Record<string, RuleDesc<unknown>>;
};
