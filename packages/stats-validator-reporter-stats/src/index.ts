import fs from 'fs';
import open from 'open';
// @ts-ignore
import { parseChunked } from '@discoveryjs/json-ext';
import { ValidationResult } from '@statoscope/stats-validator';
import { Reporter } from '@statoscope/stats-validator/dist/reporter';
import { transform } from '@statoscope/report-writer/dist/utils';
import { StatsDescriptor } from '@statoscope/stats';
import statsPackage from '@statoscope/stats/package.json';
import { Extension } from '@statoscope/stats/spec/extension';
import ExtensionValidationResultGenerator from '@statoscope/stats-extension-stats-validation-result/dist/generator';
import * as version from './version';

export type Options = { to?: string; open?: boolean };

export type StatoscopeMeta = {
  descriptor: StatsDescriptor;
  extensions: Extension<unknown>[];
};

export default class ConsoleReporter implements Reporter<Options> {
  async run(result: ValidationResult, options?: Options): Promise<void> {
    console.log(`Preparing data for Statoscope report...`);
    const generator = new ExtensionValidationResultGenerator(version);

    for (const rule of result.rules) {
      const storage = rule.api.getStorage();

      for (const entry of storage) {
        generator.handleEntry(rule.name, entry);
      }
    }

    const parsedInput = (await parseChunked(fs.createReadStream(result.input[0]))) as {
      __statoscope?: StatoscopeMeta;
    };
    const meta: StatoscopeMeta = {
      descriptor: { name: statsPackage.name, version: statsPackage.version },
      extensions: [],
    };
    parsedInput.__statoscope ??= meta;
    parsedInput.__statoscope.extensions.push(generator.get());

    console.log(`Generating Statoscope report...`);
    const reportFilename = await transform(
      {
        writer: {
          scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
          init: `function (data) {
            Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
          }`,
        },
      },
      // @ts-ignore
      [
        {
          type: 'data',
          filename: result.input[0],
          data: parsedInput,
        },
        result.reference[0],
      ].filter(Boolean),
      options?.to
    );
    console.log(`Statoscope report saved into ${reportFilename}`);

    if (options?.open) {
      open(reportFilename);
    }
  }
}
