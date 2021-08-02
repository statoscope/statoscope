import { API } from './api';

export type RuleDataInput<TInput> = { reference?: TInput; input: TInput };

export type Rule<TParams, TInput> = (
  params: TParams | null,
  data: RuleDataInput<TInput>,
  api: API
) => void;
