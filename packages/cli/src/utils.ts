import fs from 'fs';
import os from 'os';
import path from 'path';
import { Readable, Writable } from 'stream';
import HTMLWriter from '@statoscope/report-writer';

export function waitFinished(stream: Readable | Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.once('end', resolve);
    stream.once('finish', resolve);
    stream.once('error', reject);
  });
}

export async function transform(from: string[], to?: string): Promise<string> {
  const id = from.length === 1 ? path.basename(from[0], '.json') : Date.now();
  to = to || path.join(os.tmpdir(), `statoscope-report-${id}.html`);
  const outputStream = fs.createWriteStream(to);
  const htmlWriter = new HTMLWriter({
    scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
    init: `function (data: InitArg): void {
      Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
    }`,
  });

  for (const file of from) {
    const id = path.basename(file);
    htmlWriter.addChunkWriter(fs.createReadStream(file), id);
  }

  htmlWriter.getStream().pipe(outputStream);
  htmlWriter.write();

  await waitFinished(outputStream);

  return to;
}
