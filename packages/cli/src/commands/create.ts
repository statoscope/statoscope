import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { getTemplate, TemplateName } from './templates';

const SUPPORTED_ENTITIES = ['plugin', 'rule', 'reporter'];

export default function (yargs: Argv): Argv {
  return yargs.command(
    'create [entity] [output]',
    `Generate plugin, rule, reporter file
Examples:
Plugin: create plugin --output path/to/folder`,
    (yargs) => {
      return yargs
        .positional('entity', {
          describe: 'Entity fir generate: plugin, rule, reporter',
          alias: 'i',
          type: 'string',
        })
        .positional('output', {
          describe: 'path to a plugin, rule, reporter file',
          alias: 'o',
          type: 'string',
          default: './',
        })
        .demandOption('entity')
        .demandOption('output');
    },
    async (argv) => {
      if (!SUPPORTED_ENTITIES.includes(argv.entity)) {
        throw new Error(
          `${argv.input}: generation is not supported. You can generate: plugin, rule, reporter. `
        );
      }

      try {
        fs.writeFile(
          path.resolve(argv.output, `${argv.input}.ts`),
          getTemplate(argv.input as TemplateName),
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
