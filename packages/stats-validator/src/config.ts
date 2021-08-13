export type RuleExecMode = 'off' | 'error';
export type NormalizedRuleExecParams = {
  mode: RuleExecMode;
};
export type RuleExecParams = RuleExecMode | Partial<NormalizedRuleExecParams>;
export type RuleDesc<TParams> = RuleExecParams | [RuleExecParams, TParams];
export type ReporterConfig = string | [string, unknown];
export type Config = {
  plugins?: Array<string | [string, string]>;
  validate: {
    reporters: ReporterConfig[];
    rules: Record<string, RuleDesc<unknown>>;
  };
};
