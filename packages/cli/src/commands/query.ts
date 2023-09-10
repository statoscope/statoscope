import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { prepareWithJora } from '@statoscope/webpack-model';
import { RawStatsFileDescriptor } from '@statoscope/webpack-model/types';
import { parseChunked, stringifyStream } from '@discoveryjs/json-ext';
import { waitFinished } from '@statoscope/report-writer/dist/utils';

export default function (yargs: Argv): Argv {
  return yargs.command(
    'query',
    `Execute jora-query on stats file`,
    (yargs) => {
      return yargs
        .option('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('query', {
          describe: 'jora query (could be passed as stdin)',
          alias: 'q',
          type: 'string',
        })
        .array('input')
        .demandOption('input');
    },
    async (argv) => {
      const query = argv.query || fs.readFileSync(0, 'utf-8');
      const files: RawStatsFileDescriptor[] = [];

      for (const input of argv.input) {
        files.push({
          name: path.basename(input),
          data: await parseChunked(fs.createReadStream(input)),
        });
      }

      const prepared = prepareWithJora(files);
      const result = prepared.query(query);
      const outputStream = stringifyStream(result);

      outputStream.pipe(process.stdout);
      await waitFinished(outputStream);
    },
  );
}
