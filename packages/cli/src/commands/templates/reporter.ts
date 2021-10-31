export function reporterTemplate(): string {
  return `// Statoscope Reporters examples:
// https://github.com/statoscope/statoscope/blob/master/packages/stats-validator-reporter-console/src/index.ts
// https://github.com/statoscope/statoscope/blob/master/packages/stats-validator-reporter-console/src/index.ts

import { Reporter } from '@statoscope/types/types/validation/reporter';
import { Result } from '@statoscope/types/types/validation/result';

export default class NewCustomReporter implements Reporter {
  async run(result: Result): Promise<void> {
    throw new Error('Need implement NewCustomReporter.');
  }
}`;
}
