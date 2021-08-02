import path from 'path';
import { Argv } from 'yargs';
import Validator, { ValidationResult } from '@statoscope/stats-validator';
import ConsoleReporter from '@statoscope/stats-validator-reporter-console';
import StatsReporter from '@statoscope/stats-validator-reporter-stats';
import { Reporter } from '@statoscope/stats-validator/dist/reporter';
import legacyWebpackStatsValidator from './legacyWebpackValidator';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'validate [validator] [config] [input]',
    `[BETA] Validate one or more JSON stats
Examples:
Single stats: validate path/to/validator.js path/to/stats.json
Multiple stats: generate path/to/validator.js --input path/to/stats-1.json path/to/stats-2.json`,
    (yargs) => {
      return yargs
        .positional('validator', {
          describe: 'path to validator script',
          alias: 'v',
          type: 'string',
        })
        .positional('config', {
          describe: 'path to statoscope config',
          alias: 'c',
          type: 'string',
        })
        .positional('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('diff-with', {
          describe: 'path to a stats that will be used by diff-rules as "before"',
          type: 'string',
          alias: 'd',
        })
        .option('warn-as-error', {
          type: 'boolean',
          describe: 'Treat warnings as errors',
          alias: 'w',
        })
        .array('input')
        .demandOption(['input']);
    },
    async (argv) => {
      let result: ValidationResult | undefined;

      if (argv['diff-with'] && argv.input.length > 1) {
        console.warn(
          'When "diff-with" is used, only the first file from "input" will be used'
        );
      }

      // todo statoscope 6: remove this or use as prepare + validator
      if (argv.validator) {
        result = await legacyWebpackStatsValidator(
          path.relative(process.cwd(), argv.validator),
          argv.input,
          {
            warnAsError: argv['warn-as-error'],
          }
        );
      } else {
        // todo resole nearest config
        const configPath = path.resolve(argv.config);
        const validator = new Validator(configPath);

        result = await validator.validate(argv.input.map((file) => path.resolve(file)));
      }

      type ReporterItem = { reporter: Reporter<unknown>; options: unknown };

      const reporters: ReporterItem[] = [
        {
          reporter: new ConsoleReporter(),
          options: {},
        },
        {
          reporter: new StatsReporter(),
          options: {},
        },
      ];

      for (const item of reporters) {
        await item.reporter.run(result, item.options);
      }
    }
  );
}
