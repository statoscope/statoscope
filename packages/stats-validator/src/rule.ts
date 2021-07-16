import { API } from './api';

export type Rule<TParams, TInput = unknown> = (
  params: TParams,
  data: TInput,
  api: API
) => void;
