import { Readable, Writable } from 'stream';
import events from 'events';

export type ConsumeOptions = { end: boolean };

export default class Piper {
  private readonly input: Readable;
  private readonly consumers: Writable[] = [];

  constructor(input: Readable) {
    this.input = input;
  }

  getInput(): Readable {
    return this.input;
  }

  addConsumer(stream: Writable): void {
    this.consumers.push(stream);
  }

  async consume(options: ConsumeOptions = { end: true }): Promise<void> {
    const needToDrain = new WeakMap<Writable, boolean>();

    for (const consumer of this.consumers) {
      consumer.on('drain', () => needToDrain.delete(consumer));
    }

    for await (const chunk of this.input) {
      for (const consumer of this.consumers) {
        if (needToDrain.has(consumer)) {
          await events.once(consumer, 'drain');
        }
        if (!consumer.write(chunk)) {
          needToDrain.set(consumer, true);
        }
      }
    }

    if (options.end) {
      const promises: Promise<void>[] = [];

      for (const consumer of this.consumers) {
        consumer.end();
        promises.push(
          new Promise((resolve, reject) => {
            consumer.once('finish', resolve);
            consumer.once('error', reject);
          })
        );
      }

      await Promise.all(promises);
    }
  }
}
