import chalk from 'chalk';
import {
  DetailsDescriptorText,
  DetailsDescriptorTTY,
  TestEntry,
} from '@statoscope/types/types/validation/test-entry';
import { Reporter } from '@statoscope/types/types/validation/reporter';
import { Result } from '@statoscope/types/types/validation/result';
import { NormalizedExecParams } from '@statoscope/types/types/validation/rule';

export type Options = { useColors?: boolean };

export default class ConsoleReporter implements Reporter {
  constructor(public options?: Options) {}

  async run(result: Result): Promise<void> {
    const normalizedOptions: Required<Options> = {
      useColors: this.options?.useColors ?? true,
    };
    const chalkCtx = new chalk.Instance(normalizedOptions.useColors ? {} : { level: 0 });
    // file -> compilation -> rule -> entry
    const groupedStorage: Record<
      string,
      Record<
        string,
        Record<
          string,
          Array<{
            item: TestEntry;
            execParams: NormalizedExecParams;
          }>
        >
      >
    > = {};

    for (const rule of result.rules) {
      for (const item of rule.api.getStorage()) {
        const filename = item.filename ?? 'unknown file';
        const compilation = item.compilation ?? 'unknown compilation';

        groupedStorage[filename] ??= {};
        groupedStorage[filename][compilation] ??= {};
        groupedStorage[filename][compilation][rule.name] ??= [];
        groupedStorage[filename][compilation][rule.name].push({
          item,
          execParams: rule.execParams,
        });
      }
    }

    let warn = 0;
    let error = 0;

    for (const [filename, compilations] of Object.entries(groupedStorage)) {
      console.log(chalkCtx.underline(filename));
      console.group();

      for (const [compilation, rules] of Object.entries(compilations)) {
        console.log(`${chalkCtx.cyan(compilation)}`);
        console.group();

        for (const [rule, items] of Object.entries(rules)) {
          for (const result of items) {
            const type = result.execParams.mode;
            let decorate = chalkCtx.reset;

            if (type === 'error') {
              decorate = chalkCtx.red;
            } else {
              decorate = chalkCtx.yellow;
            }

            console.log(
              `${decorate(type)}  ${result.item.message}  ${chalkCtx.cyan(rule)}`,
            );

            if (result.item.details) {
              let detailDescriptor:
                | DetailsDescriptorTTY
                | DetailsDescriptorText
                | undefined;

              if (typeof result.item.details === 'string') {
                detailDescriptor = {
                  type: 'tty',
                  content: result.item.details,
                };
              } else {
                // @ts-ignore
                detailDescriptor =
                  result.item.details.find((detail) => detail.type === 'tty') ||
                  result.item.details.find((detail) => detail.type === 'text');
              }

              if (detailDescriptor) {
                let content: string | string[];

                if (typeof detailDescriptor.content === 'string') {
                  content = detailDescriptor.content;
                } else if (typeof detailDescriptor.content === 'function') {
                  content = detailDescriptor.content.call(null);
                } else {
                  content = detailDescriptor.content;
                }

                console.group();
                if (typeof content === 'string') {
                  console.log(content);
                } else {
                  for (const line of content) {
                    console.log(line);
                  }
                }
                console.groupEnd();
              }
            }

            if (type === 'error') {
              error++;
            } else {
              warn++;
            }
          }
        }

        console.groupEnd();
      }

      console.groupEnd();
      console.log('');
    }

    if (error || warn) {
      console.log(
        chalkCtx.yellow(`${error + warn} problems (${error} errors, ${warn} warnings)`),
      );
    }
  }
}
