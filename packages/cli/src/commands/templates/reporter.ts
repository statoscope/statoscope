import { FileExt } from '.';

export function reporterTemplate(fileExt: FileExt): string {
  return fileExt === FileExt.ts ? reporterTs : reporterJs;
}

const reporterJs = `class NewReporter {
  constructor(){}

  async run(result){
    console.log("Hello from new custom reporter!")
    console.log({result})
  }
}

module.exports = NewReporter;`;

const reporterTs = `import type { Reporter } from "@statoscope/types/types/validation/reporter";
import type { Result } from "@statoscope/types/types/validation/result";

class NewReporter implements Reporter {
  constructor() {}
  async run(result: Result): Promise<void> {
    console.log("Hello from new custom reporter!");
    console.log({ result });
  }
}

export default NewReporter;`;
