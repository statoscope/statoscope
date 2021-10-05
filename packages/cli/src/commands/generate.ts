import open from 'open';
import { Argv } from 'yargs';
import { createDestStatReportPath, transform } from '../utils';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'generate [input]',
    `Generate HTML report from JSON-stats
Examples:
Single stats: generate path/to/stats.json --output path/to/report.html
Multiple stats: generate --input path/to/stats-1.json path/to/stats-2.json --output path/to/report.html`,
    (yargs) => {
      return yargs
        .positional('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .positional('output', {
          describe: 'path to a report.html',
          alias: 't',
          type: 'string',
        })
        .option('open', {
          describe: 'open report after done',
          alias: 'o',
        })
        .array('input')
        .demandOption('input');
    },
    async (argv) => {
      const destReportPath = createDestStatReportPath(argv.input, argv.output);

      console.log(`Generating Statoscope report to ${destReportPath} ...`);
      await transform(argv.input, destReportPath);
      console.log(`Statoscope report saved to ${argv.output}`);

      if (argv.open) {
        open(destReportPath);
      }
    }
  );
}
