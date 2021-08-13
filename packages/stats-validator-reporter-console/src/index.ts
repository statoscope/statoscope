import chalk from 'chalk';
import {
  DetailsDescriptorText,
  DetailsDescriptorTTY,
  Reporter,
  TestEntry,
  ValidationResult,
} from '@statoscope/types/types/validation';

export type Options = { warnAsError?: boolean; useColors?: boolean };

export default class ConsoleReporter implements Reporter {
  constructor(public options?: Options) {}

  async run(result: ValidationResult): Promise<void> {
    const normalizedOptions: Required<Options> = {
      useColors: this.options?.useColors ?? true,
      warnAsError: this.options?.warnAsError ?? false,
    };
    const chalkCtx = new chalk.Instance(normalizedOptions.useColors ? {} : { level: 0 });
    // file -> compilation -> rule -> entry
    const groupedStorage: Record<string, Record<string, Record<string, TestEntry[]>>> =
      {};

    for (const rule of result.rules) {
      for (const item of rule.api.getStorage()) {
        const filename = item.filename ?? 'unknown file';
        const compilation = item.compilation ?? 'unknown compilation';

        groupedStorage[filename] ??= {};
        groupedStorage[filename][compilation] ??= {};
        groupedStorage[filename][compilation][rule.name] ??= [];
        groupedStorage[filename][compilation][rule.name].push(item);
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
          for (const item of items) {
            let decorate = chalkCtx.reset;
            if (item.type === 'error') {
              decorate = chalkCtx.red;
            } else if (item.type === 'warn') {
              decorate = chalkCtx.yellow;
            }

            console.log(
              `${decorate(item.type)}  ${item.message}  ${chalkCtx.cyan(rule)}`
            );

            if (item.details) {
              let detailDescriptor:
                | DetailsDescriptorTTY
                | DetailsDescriptorText
                | undefined;

              if (typeof item.details === 'string') {
                detailDescriptor = {
                  type: 'tty',
                  content: item.details,
                };
              } else {
                // @ts-ignore
                detailDescriptor =
                  item.details.find((detail) => detail.type === 'tty') ||
                  item.details.find((detail) => detail.type === 'text');
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

            if (item.type === 'warn') {
              if (normalizedOptions.warnAsError) {
                error++;
              } else {
                warn++;
              }
            } else if (item.type === 'error') {
              error++;
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
        chalkCtx.yellow(`${error + warn} problems (${error} errors, ${warn} warnings)`)
      );
    }

    if (error) {
      // eslint-disable-next-line no-process-exit
      process.exitCode = 1;
    }
  }
}
