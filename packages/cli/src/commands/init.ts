import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { getTemplate } from './templates';
import { FileExt, ModuleType } from './templates/types';

const CONFIG_FILE_NAME = 'statoscope.config.js';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'init [output]',
    `Generate ${CONFIG_FILE_NAME} file.
Examples:
Default: init
Custom folder: init --output ./src
    `,
    (yargs) => {
      return yargs
        .positional('output', {
          describe: `path to ${CONFIG_FILE_NAME}`,
          type: 'string',
          default: './',
        })
        .demandOption('output');
    },
    async (argv) => {
      try {
        fs.writeFile(
          path.resolve(argv.output, CONFIG_FILE_NAME),
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
