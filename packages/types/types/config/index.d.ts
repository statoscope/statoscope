import { Config as ValidatorConfig } from '../validation/config';
import { Report } from '../custom-report';

export type Config = {
  silent?: boolean;
  validate?: ValidatorConfig;
  generate?: {
    reports?: Report<unknown, unknown>[];
  };
};
