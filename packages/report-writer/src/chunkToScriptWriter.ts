import { Stream, Transform, Writable } from 'stream';

export default function makeChunkToScriptWriter(
  source: Stream,
  target: Writable,
  id: string,
): Promise<void> {
  const transformer = new Transform({
    transform(chunk, encoding, callback): void {
      callback(
        null,
        `<script type="text/plain" data-id=${JSON.stringify(id)}>${chunk
          .toString()
          .replace(/<([!/])/g, '<\\\\$1')}</script>`,
      );
    },
  });

  source.pipe(transformer);
  transformer.pipe(target, { end: false });

  return new Promise((resolve, reject) => {
    transformer.once('end', resolve);
    transformer.once('error', reject);
  });
}
