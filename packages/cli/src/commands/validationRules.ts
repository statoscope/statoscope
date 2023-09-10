import path from 'path';
import { Argv } from 'yargs';
import Validator from '@statoscope/stats-validator';
import { requireConfig } from '@statoscope/config';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'vrules',
    `Show available validation rules base on plugins in statoscope.config.js`,
    (yargs) => {
      return yargs.option('config', {
        describe: 'path to statoscope config',
        alias: 'c',
        type: 'string',
      });
    },
    async (argv) => {
      const { path: configPath, config } = requireConfig(argv.config);
      const rootPath = path.dirname(configPath);
      const validateConfig = config.validate ?? { rules: {} };
      const validator = new Validator(validateConfig, rootPath);
      let foundRules = false;

      for (const pluginConfig of Object.values(validator.plugins ?? {})) {
        for (const alias of pluginConfig.aliases) {
          const rules = Object.keys(pluginConfig.rules ?? {});
          if (rules.length) {
            console.log(`Provided from ${alias}/*`);
            foundRules = true;

            for (const rule of rules) {
              console.log(`    ${alias}/${rule}`);
            }

            console.log();
          }
        }
      }

      if (!foundRules) {
        console.log('Rules not found');
      }
    },
  );
}
