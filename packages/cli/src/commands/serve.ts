import fs from 'fs';
import http from 'http';
import { Argv } from 'yargs';
import open from 'open';
import { requireConfig } from '@statoscope/config';
import {
  combineCustomReports,
  createDestStatReportPath,
  transform,
  TransformFrom,
} from '../utils';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'serve [input]',
    `Start HTTP-server and serve JSON-stats as HTML report
Examples:
Single stats: serve path/to/stats.json
Multiple stats: serve --input path/to/stats-1.json path/to/stats-2.json
`,
    (yargs) => {
      return yargs
        .positional('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('reference', {
          describe: 'path to stats.json to diff with (e.g. master-branch stats)',
          alias: 'r',
          type: 'string',
        })
        .option('config', {
          describe: 'path to statoscope config',
          alias: 'c',
          type: 'string',
        })
        .option('port', {
          alias: 'p',
          default: '8080',
        })
        .option('host', {
          alias: 'h',
          default: 'localhost',
        })
        .option('open', {
          describe: 'open browser after start',
          alias: 'o',
        })
        .option('custom-report', {
          describe: 'path to json-file(s) with custom user report(s)',
          type: 'string',
        })
        .option('compression', {
          describe: 'use report compression',
          type: 'boolean',
          default: true,
        })
        .array(['input', 'custom-report'])
        .demandOption('input');
    },
    async (argv) => {
      console.log(`Generating Statoscope report...`);
      const destReportPath = createDestStatReportPath(argv.input);
      const files: Array<TransformFrom | string> = [];

      if (argv.reference) {
        if (argv.input.length > 1) {
          console.log(`When reference arg is specified then only first import is used`);
        }

        files.push({ name: argv.input[0], as: 'input.json' });
        files.push({ name: argv.reference, as: 'reference.json' });
      } else {
        files.push(...argv.input);
      }

      const { config } = requireConfig(argv.config);

      const customReports = combineCustomReports(config, argv['custom-report']);

      const reportPath = await transform(
        files,
        destReportPath,
        customReports,
        argv.compression,
      );

      console.log(`Statoscope report generated to ${destReportPath}`);

      http
        .createServer((req, res) => {
          fs.createReadStream(reportPath).pipe(res);
        })
        .listen({ port: argv.port, host: argv.host })
        .on('listening', () => {
          const link = `http://${argv.host}:${argv.port}`;
          console.log(`Statoscope server listen at ${link}`);

          if (argv.open) {
            open(link);
          }
        });
    },
  );
}
