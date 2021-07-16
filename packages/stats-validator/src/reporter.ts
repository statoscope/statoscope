import { ValidationResult } from './';

export interface Reporter<TOptions> {
  run(result: ValidationResult, options: TOptions): Promise<void>;
}
