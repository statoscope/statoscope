import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { getTemplate, TemplateName } from './templates';
import { FileExt, ModuleType, TemplateOptions } from './templates/types';

const SUPPORTED_ENTITIES = ['plugin', 'rule', 'reporter'];
const SUPPORTED_EXT = [FileExt.js, FileExt.ts];

export default function (yargs: Argv): Argv {
  return yargs.command(
    'create [entity] [output]',
    `Generate plugin, rule, reporter file
Examples:
create rule # create example-rule from the template
create plugin --output path/to/folder # create example-plugin from the template and save it into a specific directory
create rule --ext ts # create example-rule from the template and save it as typescript source
create reporter --module esm # create example-reporter from the template with module type esm`,
    (yargs) => {
      return yargs
        .positional('entity', {
          describe: 'Entity for generate: plugin, rule, reporter',
          type: 'string',
        })
        .positional('output', {
          describe: 'Path to a plugin, rule, reporter file',
          alias: 'o',
          type: 'string',
          default: './',
        })
        .positional('ext', {
          describe: `File extension: ${FileExt.js} or ${FileExt.ts}`,
          type: 'string',
          default: FileExt.js,
        })
        .positional('module', {
          describe: `Module type: ${ModuleType.commonjs} or ${ModuleType.esm}. Supported only js files`,
          type: 'string',
          default: ModuleType.commonjs,
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

      if (argv.ext === FileExt.ts && argv.module === ModuleType.commonjs) {
        console.log(
          `The module type will be changed to esm. Only the esm module is used to extend the ts file.`
        );
        argv.module = ModuleType.esm;
      }

      const file = path.resolve(argv.output, `${argv.entity}.statoscope.${argv.ext}`);
      try {
        fs.writeFile(
          path.resolve(argv.output, file),
          getTemplate(
            argv.entity as TemplateName,
            {
              output: {
                fileExt: argv.ext,
                module: argv.module,
              },
            } as TemplateOptions
          ),
          {
            encoding: 'utf-8',
          },
          (err) => {
            if (err) {
              throw err;
            }
          }
        );

        console.log(`Template created: ${file}`);
      } catch (err) {
        console.error(err);
      }
    }
  );
}
