import { RuleDesc } from './rule';

export type ReporterConfig = string | [string, unknown];
export type Config = {
  plugins?: Array<string | [string, string]>;
  warnAsError?: boolean;
  reporters?: ReporterConfig[];
  rules: Record<string, RuleDesc<unknown>>;
};
