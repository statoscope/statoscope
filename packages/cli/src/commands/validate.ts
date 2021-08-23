import path from 'path';
import { Argv } from 'yargs';
import Validator from '@statoscope/stats-validator';
import { Config } from '@statoscope/types/types/config';

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
          default: path.join(process.cwd(), 'statoscope.config.js'),
        })
        .option('reference', {
          describe: 'path to a stats-file to diff with',
          alias: 'r',
          type: 'string',
        })
        .demandOption(['input']);
    },
    async (argv) => {
      const configPath = path.resolve(argv.config);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = require(configPath) as Config;
      const validator = new Validator(
        config.validate ?? { rules: {} },
        path.dirname(configPath)
      );

      const result = await validator.validate(
        path.resolve(argv.input),
        argv.reference ? path.resolve(argv.reference) : void 0
      );

      await validator.report(result);
    }
  );
}
