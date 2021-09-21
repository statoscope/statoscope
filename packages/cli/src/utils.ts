import path from 'path';
import os from 'os';
import fs from 'fs';
import {
  FromItem,
  makeReplacer,
  transform as transformOriginal,
} from '@statoscope/report-writer/dist/utils';
import { parseChunked } from '@discoveryjs/json-ext';
import normalizeCompilation from '@statoscope/webpack-model/dist/normalizeCompilation';
import { Webpack } from '@statoscope/webpack-model/webpack';
import Compilation = Webpack.Compilation;

export async function transform(from: string[], to?: string): Promise<string> {
  const id = path.basename(from[0], '.json');
  const reportPath =
    to || path.join(os.tmpdir(), `statoscope-report-${id}-${Date.now()}.html`);
  const normalizedFrom: FromItem[] = [];

  for (const item of from) {
    const parsed: Compilation = await parseChunked(fs.createReadStream(item));
    normalizeCompilation(parsed);
    normalizedFrom.push({
      type: 'data',
      filename: item,
      data: parsed,
      replacer: makeReplacer(parsed.__statoscope?.context, '.', ['context', 'source']),
    });
  }

  return transformOriginal(
    {
      writer: {
        scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
        init: `function (data) {
          Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
        }`,
      },
    },
    normalizedFrom,
    reportPath
  );
}
