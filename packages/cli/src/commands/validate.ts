import path from 'path';
import { Argv } from 'yargs';
import Validator from '@statoscope/stats-validator';
import ConsoleReporter from '@statoscope/stats-validator-reporter-console';
import { Config } from '@statoscope/stats-validator/dist/config';
import { ValidationResult } from '@statoscope/types/types/validation';
import legacyWebpackStatsValidator from './legacyWebpackValidator';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'validate [validator] [input]',
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
        .positional('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('config', {
          describe: 'path to statoscope config',
          alias: 'c',
          type: 'string',
        })
        .option('reference', {
          describe: 'path to a stats-file to diff with',
          alias: 'r',
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
        .demandOption(['input']);
    },
    async (argv) => {
      let result: ValidationResult;

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
          argv.reference,
          {
            warnAsError: argv['warn-as-error'],
          }
        );
        const reporter = new ConsoleReporter();
        await reporter.run(result);
      } else {
        // todo resole nearest config
        const configPath = path.resolve(argv.config);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const config = require(configPath) as Config;
        const validator = new Validator(config, path.dirname(configPath));

        result = await validator.validate(
          path.resolve(argv.input),
          argv.reference ? path.resolve(argv.reference) : void 0
        );

        for (const item of validator.reporters) {
          await item.run(result);
        }
      }
    }
  );
}
