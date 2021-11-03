import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { FileExt, getTemplate, TemplateName } from './templates';

const SUPPORTED_ENTITIES = ['plugin', 'rule', 'reporter'];
const SUPPORTED_EXT = [FileExt.js, FileExt.ts];

export default function (yargs: Argv): Argv {
  return yargs.command(
    'create [entity] [output]',
    `Generate plugin, rule, reporter file
Examples:
default usage: create rule
create plugin --output path/to/folder # create example-plugin from the template and save it into a specific directory
create rule --ext ts # create example-rule from the template and save it as typescript source`,
    (yargs) => {
      return yargs
        .positional('entity', {
          describe: 'Entity fir generate: plugin, rule, reporter',
          type: 'string',
        })
        .positional('output', {
          describe: 'path to a plugin, rule, reporter file',
          alias: 'o',
          type: 'string',
          default: './',
        })
        .positional('ext', {
          describe: 'file extension',
          type: 'string',
          default: FileExt.js,
        })
        .demandOption('entity');
    },
    async (argv) => {
      if (!SUPPORTED_ENTITIES.includes(argv.entity)) {
        throw new Error(
          `${argv.entity}: generation is not supported. You can generate: plugin, rule, reporter. `
        );
      }

      if (!SUPPORTED_EXT.includes(argv.ext)) {
        console.log(`${argv.ext} is not supported. File will be generated with type js.`);
        argv.ext = FileExt.js;
      }

      try {
        fs.writeFile(
          path.resolve(argv.output, `${argv.entity}.statoscope.${argv.ext}`),
          getTemplate(argv.entity as TemplateName, argv.ext as FileExt),
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
