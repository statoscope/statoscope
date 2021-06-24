import { PassThrough, Readable, Writable } from 'stream';
import { promisify } from 'util';

const writeMap: WeakMap<Writable, (chunk: unknown) => Promise<unknown>> = new WeakMap();
const endMap: WeakMap<Writable, () => Promise<unknown>> = new WeakMap();

function write(stream: Writable, chunk: unknown): Promise<unknown> {
  let cached = writeMap.get(stream);

  if (!cached) {
    cached = promisify(stream.write.bind(stream));
    writeMap.set(stream, cached);
  }

  return cached(chunk);
}

function end(stream: Writable): Promise<unknown> {
  let cached = endMap.get(stream);

  if (!cached) {
    cached = promisify(stream.end.bind(stream));
    endMap.set(stream, cached);
  }

  return cached();
}

export type ConsumeOptions = { end: boolean };

export default class Piper {
  private readonly input: Readable;
  private readonly consumers: Writable[] = [];
  private readonly output = new PassThrough();

  constructor(input: Readable) {
    this.input = input;
  }

  addConsumer(stream: Writable): void {
    this.consumers.push(stream);
  }

  async consume(options: ConsumeOptions = { end: true }): Promise<void> {
    for await (const chunk of this.input) {
      for (const consumer of this.consumers) {
        await write(consumer, chunk);
      }
      await write(this.output, chunk);
    }

    if (options.end) {
      for (const consumer of this.consumers) {
        await end(consumer);
      }
      await end(this.output);
    }
  }

  getOutput(): PassThrough {
    return this.output;
  }
}
