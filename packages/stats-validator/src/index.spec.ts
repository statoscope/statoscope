import os from 'os';
import Validator from './';

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

test('should work', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    validate: {
      rules: {
        'webpack/restricted-modules': ['error', [/\.\/src/]],
        'webpack/restricted-packages': ['error', ['foo']],
      },
    },
  });

  const result = await validator.validate(
    require.resolve('../../../test/bundles/simple/stats-prod.json')
  );

  await validator.report(result);

  expect(result).toMatchSnapshot();
  expect(output).toMatchSnapshot();
});

test('custom reporter', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    validate: {
      reporters: [
        [
          require.resolve('../../../test/fixtures/stats-validator/reporters/custom.js'),
          'foo',
        ],
      ],
      rules: {
        'webpack/restricted-modules': ['error', [/\.\/src/]],
        'webpack/restricted-packages': ['error', ['foo']],
      },
    },
  });

  const result = await validator.validate(
    require.resolve('../../../test/bundles/simple/stats-prod.json')
  );

  await validator.report(result);

  expect(result).toMatchSnapshot();
  expect(output).toMatchSnapshot();
});

test('silent', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    validate: {
      reporters: [
        [
          require.resolve('../../../test/fixtures/stats-validator/reporters/custom.js'),
          'foo',
        ],
      ],
      silent: true,
      rules: {
        'webpack/restricted-modules': ['error', [/\.\/src/]],
        'webpack/restricted-packages': ['error', ['foo']],
      },
    },
  });

  const result = await validator.validate(
    require.resolve('../../../test/bundles/simple/stats-prod.json')
  );

  await validator.report(result);

  expect(result).toMatchSnapshot();
  expect(output).toMatchSnapshot();
});
