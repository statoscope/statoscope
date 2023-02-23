import fs from 'fs';
import { Argv } from 'yargs';
import { parseChunked, stringifyStream } from '@discoveryjs/json-ext';
import { waitFinished } from '@statoscope/report-writer/dist/utils';
import { Webpack } from '@statoscope/webpack-model/webpack';
import { Extension } from '@statoscope/stats/spec/extension';
import { mergeCustomExtensionsIntoCompilation } from '../utils';
import Compilation = Webpack.Compilation;

export default function (yargs: Argv): Argv {
  return yargs.command(
    'inject-extension',
    `Add an extension into existing stats`,
    (yargs) => {
      return yargs
        .option('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('extension', {
          describe:
            'path to json-file with extension (raw json could be passed as stdin)',
          alias: 'e',
          type: 'string',
        })
        .array(['extension'])
        .demandOption('input');
    },
    async (argv) => {
      const extensions: Extension<unknown>[] = [];

      const parsedExtension: Extension<unknown>[] =
        argv.extension?.map((filepath) =>
          JSON.parse(fs.readFileSync(filepath, 'utf-8'))
        ) ?? [];

      if (parsedExtension.length) {
        extensions.push(...parsedExtension.flat());
      } else {
        const stdinReports: Extension<unknown>[] = [
          JSON.parse(fs.readFileSync(0, 'utf-8') || '[]'),
        ];

        extensions.push(...stdinReports.flat());
      }

      const parsed: Compilation = await parseChunked(fs.createReadStream(argv.input));
      const merged = mergeCustomExtensionsIntoCompilation(parsed, extensions);
      const outputStream = stringifyStream(merged);

      outputStream.pipe(process.stdout);
      await waitFinished(outputStream);
    }
  );
}
