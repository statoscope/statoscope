import os from 'os';
import Validator from '../../../packages/stats-validator';
import Reporter from './';

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

test('should work', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    rules: {
      'webpack/restricted-modules': ['error', [/\/src\//]],
      'webpack/restricted-packages': ['error', ['foo']],
    },
  });
  const result = await validator.validate(
    require.resolve('../../../test/bundles/v5/simple/stats-prod.json'),
  );
  const reporter = new Reporter();
  await reporter.run(result);

  expect(output).toMatchSnapshot();
});
