import fs from 'fs';
import path from 'path';
import { Readable, Writable } from 'stream';
import { stringifyStream, TReplacer } from '@discoveryjs/json-ext';
import HTMLWriter, { Options } from './';

export function waitFinished(stream: Readable | Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.once('end', resolve);
    stream.once('finish', resolve);
    stream.once('error', reject);
  });
}

export type FromItem =
  | {
      type: 'data';
      filename: string;
      data: unknown;
      replacer?: TReplacer;
    }
  | {
      type: 'filename';
      filename: string;
      replacer?: TReplacer;
    };

export async function transform(
  options: {
    writer: Options;
  },
  from: Array<string | FromItem>,
  to: string
): Promise<string> {
  const normalizedFrom: FromItem[] = from.map((item) =>
    typeof item === 'string' ? { type: 'filename', filename: item } : item
  );
  const toDir = path.dirname(to);
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true });
  }
  const outputStream = fs.createWriteStream(to);
  const htmlWriter = new HTMLWriter(options.writer);

  for (const fromItem of normalizedFrom) {
    const id = path.basename(fromItem.filename);
    let stream: Readable;

    if (fromItem.type === 'filename') {
      stream = fs.createReadStream(fromItem.filename);
    } else {
      stream = stringifyStream(fromItem.data, fromItem.replacer);
    }

    htmlWriter.addChunkWriter(stream, id);
  }

  htmlWriter.getStream().pipe(outputStream);
  htmlWriter.write();

  await waitFinished(outputStream);

  return to;
}

export function makeReplacer(
  from?: string,
  to = '',
  ignoreKeys: string[] = []
): TReplacer | undefined {
  if (!from) {
    return;
  }

  return (key, value): unknown => {
    if (typeof value === 'string' && !ignoreKeys.includes(key)) {
      if (value.includes(from)) return value.split(from).join(to);
    }

    return value;
  };
}
