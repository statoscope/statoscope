import open from 'open';
import { Argv } from 'yargs';
import { transform } from '../utils';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'generate [input] [output]',
    `Generate HTML report from JSON-stats
Examples:
Single stats: generate path/to/stats.json path/to/report.html
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
        .demandOption(['input', 'output']);
    },
    async (argv) => {
      console.log(`Generating Statoscope report to ${argv.output} ...`);
      await transform(argv.input, argv.output);
      console.log(`Statoscope report saved to ${argv.output}`);

      if (argv.open) {
        open(argv.output);
      }
    }
  );
}
