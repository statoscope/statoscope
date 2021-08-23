import { Result } from './result';

export interface Reporter {
  run(result: Result): Promise<void>;
}
