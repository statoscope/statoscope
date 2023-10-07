import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { getTemplate, TemplateName } from './templates';
import { FileExt, ModuleType, TemplateOptions } from './templates/types';

const SUPPORTED_ENTITIES = ['plugin', 'rule', 'reporter'];
const SUPPORTED_EXT = [FileExt.js, FileExt.ts];

export default function (yargs: Argv): Argv {
  return yargs.command(
    'create',
    `Generate custom validator plugin/rule/reporter
Examples:
create rule     # create example rule from the template

create plugin   # create example plugin from the template

create reporter # create example-reporter from the template`,
    (yargs) => {
      return yargs
        .option('entity', {
          describe: 'Entity to generate',
          alias: 'e',
          choices: ['plugin', 'rule', 'reporter'],
        })
        .option('output', {
          describe: 'Path to generated code',
          alias: 'o',
          type: 'string',
          default: './',
        })
        .option('type', {
          describe: `Output type`,
          choices: [FileExt.js, FileExt.ts],
          alias: 't',
          default: FileExt.js,
        })
        .option('module', {
          describe: `Output modules type`,
          choices: [ModuleType.commonjs, ModuleType.esm],
          alias: 'm',
          default: ModuleType.commonjs,
        })
        .demandOption('entity');
    },
    async (argv) => {
      if (!SUPPORTED_ENTITIES.includes(argv.entity)) {
        throw new Error(
          `${argv.entity}: generation is not supported. You can generate: plugin, rule, reporter. `,
        );
      }

      if (!SUPPORTED_EXT.includes(argv.type)) {
        console.log(
          `${argv.type} is not supported. File will be generated with type js.`,
        );
        argv.type = FileExt.js;
      }

      if (argv.type === FileExt.ts && argv.module === ModuleType.commonjs) {
        console.log(
          `The module type will be changed to esm. Only the esm module is used to extend the ts file.`,
        );
        argv.module = ModuleType.esm;
      }

      const file = path.resolve(argv.output, `${argv.entity}.statoscope.${argv.type}`);
      try {
        fs.writeFile(
          path.resolve(argv.output, file),
          getTemplate(
            argv.entity as TemplateName,
            {
              output: {
                fileExt: argv.type,
                module: argv.module,
              },
            } as TemplateOptions,
          ),
          {
            encoding: 'utf-8',
          },
          (err) => {
            if (err) {
              throw err;
            }
          },
        );

        console.log(`Template created: ${file}`);
      } catch (err) {
        console.error(err);
      }
    },
  );
}
