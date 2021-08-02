import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import generate from './generate';

const inputFixtures = [
  '../../../../test/bundles/simple/stats-prod.json',
  '../../../../test/bundles/simple/stats-prod.json',
  '../../../../test/bundles/simple/stats-prod.json',
  '../../../../test/bundles/simple/stats-prod.json',
].map((filepath) => path.resolve(__dirname, filepath));
const inputArgs = inputFixtures.map((filename) => ['--input', filename]).flat();

const rootPath = path.resolve(__dirname, '../../../../');
const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));
const webpackUIFixture = path.join(rootPath, 'test/fixtures/report-writer/injectable.js');
const statsFixture = path.join(rootPath, 'test/fixtures/report-writer/source.json');
const mockedContent = new Map([
  [require.resolve('@statoscope/webpack-ui'), webpackUIFixture],
  [require.resolve('../../../../test/bundles/simple/stats-prod.json'), statsFixture],
]);

fs.mkdirSync(outputDir, { recursive: true });

jest.mock('fs', () => {
  const ofs = jest.requireActual('fs');
  return {
    ...ofs,
    readFile(name: string, ...args: unknown[]): unknown {
      const mocked = mockedContent.get(path.resolve(name));

      if (mocked) {
        name = mocked;
      }

      return ofs.readFile(name, ...args);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    readFileSync(name: string, ...args: unknown[]): unknown {
      const mocked = mockedContent.get(path.resolve(name));

      if (mocked) {
        name = mocked;
      }

      return ofs.readFileSync(name, ...args);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    createReadStream(name: string, ...args: unknown[]): unknown {
      const mocked = mockedContent.get(path.resolve(name));

      if (mocked) {
        name = mocked;
      }

      return ofs.createReadStream(name, ...args);
    },
  };
});

test('should work', async () => {
  const outputPath = path.join(outputDir, `${Date.now()}.html`);
  let y = yargs(['generate', ...inputArgs, '--output', outputPath]);

  y = generate(y);
  y.fail((_, error) => {
    console.error(error);
  });

  await y.argv;

  expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
});
