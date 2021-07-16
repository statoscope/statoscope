import { ValidationResult } from '@statoscope/stats-validator';
import chalk from 'chalk';
import { Reporter } from '@statoscope/stats-validator/dist/reporter';
import {
  DetailsDescriptorText,
  DetailsDescriptorTTY,
  TestEntry,
} from '@statoscope/stats-validator/dist/test-entry';

export type Options = { warnAsError: boolean };

export default class ConsoleReporter implements Reporter<Options> {
  async run(result: ValidationResult, options: Options): Promise<void> {
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
      console.log(chalk.underline(filename));
      console.group();

      for (const [compilation, rules] of Object.entries(compilations)) {
        console.log(`${chalk.cyan(compilation)}`);
        console.group();

        for (const [rule, items] of Object.entries(rules)) {
          for (const item of items) {
            let decorate = chalk.reset;
            if (item.type === 'error') {
              decorate = chalk.red;
            } else if (item.type === 'warn') {
              decorate = chalk.yellow;
            }

            console.log(`${decorate(item.type)}  ${item.message}  ${chalk.cyan(rule)}`);

            if (item.details) {
              let detailDescriptor:
                | DetailsDescriptorTTY
                | DetailsDescriptorText
                | undefined;

              if (typeof item.details === 'string') {
                detailDescriptor = { type: 'tty', content: item.details };
              } else {
                detailDescriptor =
                  (item.details.find((item) => item.type === 'tty') as
                    | DetailsDescriptorTTY
                    | undefined) ||
                  (item.details.find((item) => item.type === 'text') as
                    | DetailsDescriptorText
                    | undefined);

                if (!detailDescriptor) {
                  throw new Error(
                    `[${rule}] Unknown item detail ${JSON.stringify(item.details)}`
                  );
                }
              }

              if (typeof detailDescriptor.content === 'string') {
                console.log(detailDescriptor.content);
              } else {
                for (const line of detailDescriptor.content) {
                  console.log(line);
                }
              }
            }

            if (item.type === 'warn') {
              if (options.warnAsError) {
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
        chalk.yellow(`${error + warn} problems (${error} errors, ${warn} warnings)`)
      );
    }

    if (error) {
      // eslint-disable-next-line no-process-exit
      process.exitCode = 1;
    }
  }
}
