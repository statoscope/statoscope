import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { getTemplate } from './templates';
import { FileExt, ModuleType } from './templates/types';

const CONFIG_FILE_NAME = 'statoscope.config.js';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'init',
    `Generate statoscope config file`,
    (yargs) => {
      return yargs
        .option('output', {
          describe: `config file name`,
          type: 'string',
          alias: 'o',
          default: path.resolve(CONFIG_FILE_NAME),
        })
        .demandOption('output');
    },
    async (argv) => {
      try {
        fs.writeFile(
          path.resolve(argv.output),
          getTemplate('config', {
            output: {
              module: ModuleType.commonjs,
              fileExt: FileExt.js,
            },
          }),
          {
            encoding: 'utf-8',
          },
          (err) => {
            if (err) {
              throw err;
            }
          }
        );
      } catch (err) {
        console.error(err);
      }
    }
  );
}
