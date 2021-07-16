export type RuleExecMode = 'off' | 'error';
export type RuleExecParams =
  | RuleExecMode
  | {
      mode: RuleExecMode;
    };
export type RuleDesc<TParams> = RuleExecParams | [RuleExecParams, TParams];
export type Config = {
  plugins?: Array<string | [string, string]>;
  rules: Record<string, RuleDesc<unknown>>;
};
