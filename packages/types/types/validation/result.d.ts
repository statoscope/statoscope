import { NormalizedExecParams } from './rule';
import { API } from './api';

export type Item = {
  name: string;
  api: API;
  execParams: NormalizedExecParams;
};

export type Result = {
  rules: Array<Item>;
  files: {
    input: string;
    reference?: string | null;
  };
};
