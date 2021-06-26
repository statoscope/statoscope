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

const inputFixturePath = path.resolve(
  __dirname,
  '../../../../test/bundles/simple/stats-dev.json'
);

const consoleLog = console.log.bind(console);
const output: string[][] = [];
let consoleLogSpy: jest.SpyInstance<void, string[]> | null = null;

beforeEach(() => {
  consoleLogSpy = jest
    .spyOn(global.console, 'log')
    .mockImplementation((...args: string[]) => {
      output.push(args);
    });
});

afterEach(() => {
  consoleLogSpy?.mockRestore();
  output.length = 0;
});

function getOutput(): string[][] {
  return output;
}

describe('validtor types', () => {
  test.each(validatorFixturesJoraQuery)('raw jora-query $name', async (item) => {
    process.on('exit', (code) => {
      console.log('!@!@!@!X');
      if (code) {
        consoleLog(getOutput());
      }
    });

    let y = yargs(['validate', '--validator', item.path, '--input', inputFixturePath]);

    y = validate(y);
    y.fail((message, error) => {
      console.error(error);
    });

    await y.argv;

    expect(getOutput()).toMatchSnapshot();
  });
});
