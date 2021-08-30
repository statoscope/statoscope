import { Config as ValidatorConfig } from '../validation/config';

export type Config = {
  silent?: boolean;
  validate?: ValidatorConfig;
};
