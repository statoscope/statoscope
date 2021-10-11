import { RelationItem, ViewConfig } from './index';

export type Report<TData, TContext> = {
  id: string;
  name?: string;
  compilation?: string | null;
  relations?: RelationItem[];
  data?: TData | (() => Promise<TData> | TData);
  context?: TContext;
  view: ViewConfig<TData, TContext>;
};
