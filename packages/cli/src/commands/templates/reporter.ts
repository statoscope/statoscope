import { concatTemplateParts, templatePartsByOptions } from './templateParts';
import { FileExt, RuleTemplatesPartsFromFileExt, Template } from './types';

export const reporterTemplate: Template = (templateOptions) => {
  const reporter = templatePartsByOptions(templateOptions, {
    js: jsReporter,
    ts: tsReporter,
  });

  return concatTemplateParts(reporter);
};

const tsReporter: RuleTemplatesPartsFromFileExt[FileExt.ts] = {
  imports: `import type { Reporter } from "@statoscope/types/types/validation/reporter";
import type { Result } from "@statoscope/types/types/validation/result";`,
  body: `class NewReporter implements Reporter {
  constructor() {}
  async run(result: Result): Promise<void> {
    console.log("Hello from new custom reporter!");
    console.log({ result });
  }
}`,
  exports: `export default NewReporter;`,
};

const jsReporter: RuleTemplatesPartsFromFileExt[FileExt.js] = {
  imports: {
    commonjs: '',
    esm: '',
  },
  body: `class NewReporter {
  constructor() {}
  /**
   * @typedef {import('@statoscope/types/types/validation/result').Result} Result
   * @param {Result} result
   * @returns {Promise<void>}
   */
  async run(result) {
    console.log("Hello from new custom reporter!");
    console.log({ result });
  }
}`,
  exports: {
    commonjs: `module.exports = NewReporter;`,
    esm: `export default NewReporter;`,
  },
};
