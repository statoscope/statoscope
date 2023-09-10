import fs from 'fs';
import { Argv } from 'yargs';
import { parseChunked, stringifyStream } from '@discoveryjs/json-ext';
import { waitFinished } from '@statoscope/report-writer/dist/utils';
import type { Webpack } from '@statoscope/webpack-model/webpack';
import { mergeCustomReportsIntoCompilation } from '../utils';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'inject-report',
    `Add report into existing stats`,
    (yargs) => {
      return yargs
        .option('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('report', {
          describe:
            'path to json-file with report description (raw json could be passed as stdin)',
          alias: 'r',
          type: 'string',
        })
        .array(['report'])
        .demandOption('input');
    },
    async (argv) => {
      const reports = [];

      const parsedReports: unknown[] =
        argv.report?.map((filepath) => JSON.parse(fs.readFileSync(filepath, 'utf-8'))) ??
        [];

      if (parsedReports.length) {
        reports.push(...parsedReports.flat());
      } else {
        const stdinReports: unknown[] = [JSON.parse(fs.readFileSync(0, 'utf-8') || '[]')];

        reports.push(...stdinReports.flat());
      }

      const parsed: Webpack.Compilation = await parseChunked(
        fs.createReadStream(argv.input),
      );
      const merged = mergeCustomReportsIntoCompilation(parsed, reports);
      const outputStream = stringifyStream(merged);

      outputStream.pipe(process.stdout);
      await waitFinished(outputStream);
    },
  );
}
