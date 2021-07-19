import { API } from './api';

export type Rule<TParams, TInput> = (params: TParams, data: TInput, api: API) => void;

export type DiffRuleInput<TInput> = { before: TInput; after: TInput };

export type DiffRule<TParams, TInput> = Rule<TParams, DiffRuleInput<TInput>>;
