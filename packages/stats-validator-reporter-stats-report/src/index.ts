import fs from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import open from 'open';
import { parseChunked, stringifyStream } from '@discoveryjs/json-ext';
import {
  FromItem,
  makeReplacer,
  transform,
  waitFinished,
} from '@statoscope/report-writer/dist/utils';
import statsPackage from '@statoscope/stats/package.json';
import ExtensionValidationResultGenerator from '@statoscope/stats-extension-stats-validation-result/dist/generator';
import { Reporter } from '@statoscope/types/types/validation/reporter';
import { Result } from '@statoscope/types/types/validation/result';
import normalizeCompilation from '@statoscope/webpack-model/dist/normalizeCompilation';
import { StatoscopeMeta } from '@statoscope/webpack-model/webpack';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../package.json');

export type Options = {
  saveReportTo?: string;
  saveStatsTo?: string;
  open?: boolean;
};

export default class ConsoleReporter implements Reporter {
  constructor(public options?: Options) {}

  async run(result: Result): Promise<void> {
    console.log(`Preparing data for Statoscope report...`);
    const generator = new ExtensionValidationResultGenerator({
      adapter: version.adapter,
      author: version.author,
      description: version.description,
      homepage: version.homepage,
      name: version.name,
      version: version.version,
    });

    for (const rule of result.rules) {
      const storage = rule.api.getStorage();
      const ruleDescriptor = rule.api.getRuleDescriptor();

      if (ruleDescriptor) {
        generator.handleRule(rule.name, ruleDescriptor);
      }

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
    parsedInput.__statoscope.extensions ??= [];
    parsedInput.__statoscope.extensions.push(generator.get());

    let parsedReference;

    if (result.files.reference) {
      parsedReference = await parseChunked(fs.createReadStream(result.files.reference));
    }

    const id = path.basename(result.files.input, '.json');
    const reportPath =
      this.options?.saveReportTo ||
      path.join(os.tmpdir(), `statoscope-report-${id}-${Date.now()}.html`);
    const statsPath = this.options?.saveStatsTo;

    if (statsPath) {
      console.log(`Generating stats...`);
      const toDir = path.dirname(statsPath);
      if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
      }
      const statsFileStream = fs.createWriteStream(statsPath);
      const statStream: Readable = stringifyStream(
        parsedInput,
        makeReplacer(parsedInput.__statoscope.context, '.', ['context', 'source'])
      );
      statStream.pipe(statsFileStream);
      await waitFinished(statsFileStream);
      console.log(`Stats saved into ${statsPath}`);
    }

    if (this.options?.saveReportTo || this.options?.open) {
      console.log(`Generating Statoscope report...`);
      normalizeCompilation(parsedInput);

      if (parsedReference) {
        normalizeCompilation(parsedReference);
      }

      const reportFilename = await transform(
        {
          writer: {
            scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
            init: `function (data) {
            Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
          }`,
          },
        },
        [
          {
            type: 'data',
            filename: 'input.json',
            data: parsedInput,
            replacer: makeReplacer(parsedInput.__statoscope?.context, '.', [
              'context',
              'source',
            ]),
          },
          parsedReference
            ? {
                type: 'data',
                filename: 'reference.json',
                data: parsedReference,
                replacer: makeReplacer(parsedReference.__statoscope?.context, '.', [
                  'context',
                  'source',
                ]),
              }
            : null,
        ].filter(Boolean) as FromItem[],
        reportPath
      );
      console.log(`Statoscope report saved into ${reportFilename}`);

      if (this.options?.open) {
        open(reportFilename);
      }
    }
  }
}
