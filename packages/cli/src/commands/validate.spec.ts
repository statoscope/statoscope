import os from 'os';
import path from 'path';
import yargs from 'yargs';
import validate from './validate';

const configFixturePath = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/validate/config.js'
);

const configWithReportersFixturePath = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/validate/config-with-reporters.js'
);

const configReferenceFixturePath = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/validate/config-reference.js'
);

const inputFixturePath = path.resolve(
  __dirname,
  '../../../../test/bundles/v5/simple/stats-dev.json'
);

const referenceFixturePath = path.resolve(
  __dirname,
  '../../../../test/bundles/v4/simple/stats-dev.json'
);

const output: string[][] = [];
let consoleLogSpy: jest.SpyInstance<void, string[]> | null = null;

beforeEach(() => {
  consoleLogSpy = jest
    .spyOn(global.console, 'log')
    .mockImplementation((...args: string[]) => {
      output.push(
        args.map((o) =>
          String(o).replace(process.cwd(), '<pwd>').replace(os.tmpdir(), '<tmp>')
        )
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
    test('single', async () => {
      let y = yargs([
        'validate',
        '--config',
        configFixturePath,
        '--input',
        inputFixturePath,
      ]);

      y = validate(y);
      y.fail((_, error) => {
        console.error(error);
      });

      await y.argv;

      expect(getOutput()).toMatchSnapshot();
    });

    test('reference', async () => {
      let y = yargs([
        'validate',
        '--config',
        configReferenceFixturePath,
        '--input',
        inputFixturePath,
        '--reference',
        referenceFixturePath,
      ]);

      y = validate(y);
      y.fail((_, error) => {
        console.error(error);
      });

      await y.argv;

      expect(getOutput()).toMatchSnapshot();
    });

    test('reporter', async () => {
      let y = yargs([
        'validate',
        '--config',
        configWithReportersFixturePath,
        '--input',
        inputFixturePath,
      ]);

      y = validate(y);
      y.fail((_, error) => {
        console.error(error);
      });

      await y.argv;

      expect(getOutput()).toMatchSnapshot();
    });
  });
});
