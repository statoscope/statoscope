import path from 'path';
import { Argv } from 'yargs';
import Validator from '@statoscope/stats-validator';
import ConsoleReporter from '@statoscope/stats-validator-reporter-console';
import { Reporter } from '@statoscope/types/types/validation/reporter';
import { makeReporterInstance } from '@statoscope/config/dist/make-reporter-instance';
import { requireConfig } from '@statoscope/config';
import legacyWebpackValidator from './legacyWebpackValidator';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'validate [validator] [input]',
    `Validate or compare JSON stats
Examples:
Validate stats: validate --input path/to/stats.json
Compare stats: validate --input path/to/branch.json --reference path/to/master.json
Validate stats [DEPRECATED]: validate --validator path/to/validator.js --input path/to/stats.json
Validate multiple stats [DEPRECATED]: validate --validator path/to/validator.js --input path/to/stats.json --input path/to/another/stats.json`,
    (yargs) => {
      return (
        yargs
          // todo remove in 6.0
          .option('validator', {
            describe: '[DEPRECATED] path to validator script',
            alias: 'v',
            type: 'string',
          })
          .option('config', {
            describe: 'path to statoscope config',
            alias: 'c',
            type: 'string',
          })
          .option('input', {
            describe: 'path to a stats.json',
            alias: 'i',
            type: 'string',
          })
          .option('reference', {
            describe: 'path to a stats-file to compare with',
            alias: 'r',
            type: 'string',
          })
          .option('warn-as-error', {
            describe: 'treat warn as error',
            alias: 'w',
            type: 'boolean',
          })
          .demandOption(['input'])
          .array('input')
      );
    },
    async (argv) => {
      if (argv.validator) {
        await legacyWebpackValidator({
          validator: argv.validator,
          input: argv.input,
          warnAsError: argv['warn-as-error'],
        });
        return;
      }

      const { path: configPath, config } = requireConfig(argv.config);
      const rootPath = path.dirname(configPath);
      const validateConfig = config.validate ?? { rules: {} };

      if (argv['warn-as-error']) {
        validateConfig.warnAsError = true;
      }

      const validator = new Validator(validateConfig, rootPath);
      const reporters: Reporter[] = [];

      if (config?.silent !== true) {
        if (config?.validate?.reporters) {
          for (const item of config.validate.reporters) {
            reporters.push(makeReporterInstance(item, rootPath));
          }
        } else {
          reporters.push(new ConsoleReporter());
        }
      }

      const result = await validator.validate(
        path.resolve(argv.input[0]),
        argv.reference ? path.resolve(argv.reference) : void 0,
      );

      for (const rule of result.rules) {
        const storage = rule.api.getStorage();

        if (rule.execParams.mode === 'error' && storage.length) {
          process.exitCode = 1;
          break;
        }
      }

      for (const reporter of reporters) {
        await reporter.run(result);
      }
    },
  );
}
