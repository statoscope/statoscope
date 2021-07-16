import path from 'path';
import yargs from 'yargs';
import validate from './validate';

const validatorFixturesJoraQuery = [
  '../../../../test/fixtures/cli/validate/ok.jora',
  '../../../../test/fixtures/cli/validate/fail.jora',
  '../../../../test/fixtures/cli/validate/rules.jora',
].map((filename) => ({
  name: path.basename(filename),
  path: path.resolve(__dirname, filename),
}));

const validatorFixturesJSJoraQuery = [
  '../../../../test/fixtures/cli/validate/jora-ok.js',
  '../../../../test/fixtures/cli/validate/jora-fail.js',
].map((filename) => ({
  name: path.basename(filename),
  path: path.resolve(__dirname, filename),
}));

const inputFixturePath = [
  '../../../../test/bundles/simple/stats-dev.json',
  '../../../../test/bundles/v4/simple/stats-dev.json',
].map((filepath) => path.resolve(__dirname, filepath));

// const consoleLog = console.log.bind(console);
const output: string[][] = [];
let consoleLogSpy: jest.SpyInstance<void, string[]> | null = null;

beforeEach(() => {
  consoleLogSpy = jest
    .spyOn(global.console, 'log')
    .mockImplementation((...args: string[]) => {
      output.push(args.map((o) => String(o).replace(process.cwd(), '<pwd>')));
    });
});

afterEach(() => {
  consoleLogSpy?.mockRestore();
  output.length = 0;
});

function getOutput(): string[][] {
  return output;
}

describe('validator types', () => {
  test.each(validatorFixturesJoraQuery)('raw jora-query $name', async (item) => {
    let y = yargs(['validate', '--validator', item.path, '--input', ...inputFixturePath]);

    y = validate(y);
    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(getOutput()).toMatchSnapshot();
  });

  test.each(validatorFixturesJSJoraQuery)('jora-query from js $name', async (item) => {
    let y = yargs(['validate', '--validator', item.path, '--input', ...inputFixturePath]);

    y = validate(y);
    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(getOutput()).toMatchSnapshot();
  });
});
