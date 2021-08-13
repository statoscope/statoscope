import fs from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import open from 'open';
// @ts-ignore
import { parseChunked, stringifyStream } from '@discoveryjs/json-ext';
import { transform, waitFinished } from '@statoscope/report-writer/dist/utils';
import { StatsDescriptor } from '@statoscope/stats';
import statsPackage from '@statoscope/stats/package.json';
import { Extension } from '@statoscope/stats/spec/extension';
import ExtensionValidationResultGenerator from '@statoscope/stats-extension-stats-validation-result/dist/generator';
import { Reporter, ValidationResult } from '@statoscope/types/types/validation';
import * as version from './version';

export type Options = {
  saveReportTo?: string;
  saveStatsTo?: string;
  saveOnlyStats: boolean;
  open?: boolean;
};

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

    const parsedInput = (await parseChunked(fs.createReadStream(result.files.input))) as {
      __statoscope?: StatoscopeMeta;
    };
    const meta: StatoscopeMeta = {
      descriptor: { name: statsPackage.name, version: statsPackage.version },
      extensions: [],
    };
    parsedInput.__statoscope ??= meta;
    parsedInput.__statoscope.extensions.push(generator.get());

    let parsedReference;

    if (result.files.reference) {
      parsedReference = await parseChunked(fs.createReadStream(result.files.reference));
    }

    const id = path.basename(result.files.input, '.json');
    const reportPath =
      options?.saveReportTo ||
      path.join(os.tmpdir(), `statoscope-report-${id}-${Date.now()}.html`);
    const statsPath = options?.saveStatsTo;

    if (statsPath) {
      console.log(`Generating stats...`);
      const toDir = path.dirname(statsPath);
      if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
      }
      const statsFileStream = fs.createWriteStream(statsPath);
      const statStream: Readable = stringifyStream(parsedInput);
      statStream.pipe(statsFileStream);
      await waitFinished(statsFileStream);
      console.log(`Stats saved into ${statsPath}`);
    }

    if (reportPath && !options?.saveOnlyStats) {
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
            filename: 'input.json',
            data: parsedInput,
          },
          parsedReference
            ? {
                type: 'data',
                filename: 'reference.json',
                data: parsedReference,
              }
            : null,
        ].filter(Boolean),
        reportPath
      );
      console.log(`Statoscope report saved into ${reportFilename}`);

      if (options?.open) {
        open(reportFilename);
      }
    }
  }
}
