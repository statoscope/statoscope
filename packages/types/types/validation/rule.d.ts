export type ExecMode = 'off' | 'error' | 'warn';
export type NormalizedExecParams = {
  mode: ExecMode;
};
export type ExecParams = ExecMode | Partial<NormalizedExecParams>;
export type RuleDesc<TParams> = ExecParams | [ExecParams, TParams];
