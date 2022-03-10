import { Config as ValidatorConfig } from '../validation/config';
import { Report } from '../custom-report';

export type Config = {
  silent?: boolean;
  validate?: ValidatorConfig;
  reports?: Report<unknown, unknown>[];
};
