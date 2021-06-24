/* global Statoscope */

import fs from 'fs';
import os from 'os';
import path from 'path';
import HTMLWriter, { InitArg } from '@statoscope/report-writer';

export async function transform(from: string[], to?: string): Promise<string> {
  const id = from.length === 1 ? path.basename(from[0], '.json') : Date.now();
  to = to || path.join(os.tmpdir(), `statoscope-report-${id}.html`);
  const htmlWriter = new HTMLWriter({
    scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
    init: function (data: InitArg): void {
      // @ts-ignore
      Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
    },
  });

  for (const file of from) {
    const id = path.basename(file);
    htmlWriter.addChunkWriter(fs.createReadStream(file), id);
  }

  htmlWriter.getStream().pipe(fs.createWriteStream(to));

  await htmlWriter.write();
  return to;
}
