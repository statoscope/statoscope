import fs from 'fs';
import { Argv } from 'yargs';
import { parseChunked, stringifyStream } from '@discoveryjs/json-ext';
import Generator, {
  Payload,
} from '@statoscope/stats-extension-custom-reports/dist/generator';
import { waitFinished } from '@statoscope/report-writer/dist/utils';
import { Webpack } from '@statoscope/webpack-model/webpack';
import Compilation = Webpack.Compilation;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reports = [];

      const parsedReports: unknown[] =
        argv.report?.map((filepath) => JSON.parse(fs.readFileSync(filepath, 'utf-8'))) ??
        [];

      if (parsedReports.length) {
        reports.push(...parsedReports.flat());
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stdinReports: any[] = [JSON.parse(fs.readFileSync(0, 'utf-8') || '[]')];

        reports.push(...stdinReports.flat());
      }

      const parsed = (await parseChunked(fs.createReadStream(argv.input))) as Compilation;

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
        if (
          report &&
          typeof report === 'object' &&
          report.constructor === Object &&
          typeof report.id !== 'undefined' &&
          typeof report.view !== 'undefined'
        ) {
          if (!customReportGenerator.handleReport(report)) {
            console.log(`Can't add report ${report.id}, it's already exists`);
          }
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

      const outputStream = stringifyStream(parsed);

      outputStream.pipe(process.stdout);
      await waitFinished(outputStream);
    }
  );
}
