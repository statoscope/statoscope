import fs from 'fs';
import { Argv } from 'yargs';
import { parseChunked, stringifyStream } from '@discoveryjs/json-ext';
import Generator, {
  Payload,
} from '@statoscope/stats-extension-custom-reports/dist/generator';
import { waitFinished } from '@statoscope/report-writer/dist/utils';
import { Webpack } from '@statoscope/webpack-model/webpack';
import { isCustomReport } from '../utils';
import Compilation = Webpack.Compilation;

export function mergeReports(reports: unknown[], parsed: Compilation): Compilation {
  parsed.__statoscope ??= {};
  parsed.__statoscope.extensions ??= [];
  const customReportsExtensionIx = parsed.__statoscope.extensions.findIndex(
    (ext) => ext.descriptor.name === '@statoscope/stats-extension-custom-reports'
  );
  const customReportsExtension =
    customReportsExtensionIx > -1
      ? parsed.__statoscope.extensions[customReportsExtensionIx]
      : null;
  const customReportGenerator = new Generator();
  if (customReportsExtension?.payload) {
    const payload = customReportsExtension.payload as Payload;

    for (const compilationItem of payload.compilations) {
      for (const report of compilationItem.reports) {
        customReportGenerator.handleReport(report);
      }
    }
  }

  for (const report of reports) {
    if (isCustomReport(report)) {
      customReportGenerator.handleReport(report);
    } else {
      throw new Error(
        `Can't add a report. A valid report should contain id and view fields`
      );
    }
  }

  if (customReportsExtension) {
    parsed.__statoscope.extensions.splice(customReportsExtensionIx, 1);
  }

  parsed.__statoscope.extensions.push(customReportGenerator.get());

  return parsed;
}

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

      const parsed: Compilation = await parseChunked(fs.createReadStream(argv.input));
      const merged = mergeReports(reports, parsed);
      const outputStream = stringifyStream(merged);

      outputStream.pipe(process.stdout);
      await waitFinished(outputStream);
    }
  );
}
