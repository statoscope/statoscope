import os from 'os';
import path from 'path';
import yargs from 'yargs';
import validate from './validate';

const configWithRulesFixturePath = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/validate/config2.js',
);

const output: string[][] = [];
let consoleLogSpy: jest.SpyInstance<void, string[]> | null = null;

beforeEach(() => {
  consoleLogSpy = jest
    .spyOn(global.console, 'log')
    .mockImplementation((...args: string[]) => {
      output.push(
        args.map((o) =>
          String(o).replace(process.cwd(), '<pwd>').replace(os.tmpdir(), '<tmp>'),
        ),
      );
    });
});

afterEach(() => {
  consoleLogSpy?.mockRestore();
  output.length = 0;
});

function getOutput(): string[][] {
  return output;
}

describe('with config', () => {
  describe('explicit', () => {
    test('rules', async () => {
      let y = yargs(['vrules', '--config', configWithRulesFixturePath]);

      y = validate(y);
      y.fail((_, error) => {
        console.error(error);
      });

      await y.argv;

      expect(getOutput()).toMatchSnapshot();
    });

    test('rules not found', async () => {
      let y = yargs(['vrules']);

      y = validate(y);
      y.fail((_, error) => {
        console.error(error);
      });

      await y.argv;

      expect(getOutput()).toMatchSnapshot();
    });
  });
});
