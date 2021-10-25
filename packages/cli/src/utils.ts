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

export type TransformFrom = {
  name: string;
  as: string;
};

export async function transform(
  from: Array<TransformFrom | string>,
  to: string
): Promise<string> {
  const normalizedFrom: FromItem[] = [];

  for (const item of from) {
    const filename = typeof item === 'string' ? item : item.name;
    const as = typeof item === 'string' ? item : item.as;
    const parsed: Compilation = await parseChunked(fs.createReadStream(filename));
    normalizeCompilation(parsed);
    normalizedFrom.push({
      type: 'data',
      filename: as,
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
    to
  );
}

export const createDestStatReportPath = (from: string[], to?: string): string => {
  const id = path.basename(from[0], '.json');
  return to || path.join(os.tmpdir(), `statoscope-report-${id}-${Date.now()}.html`);
};
