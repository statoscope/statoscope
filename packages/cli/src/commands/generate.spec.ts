import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import generate from './generate';

const inputFixtures = [
  '../../../../test/bundles/simple/stats-dev.json',
  '../../../../test/bundles/simple/stats-prod.json',
  '../../../../test/bundles/v4/simple/stats-dev.json',
  '../../../../test/bundles/v4/simple/stats-prod.json',
].map((filepath) => path.resolve(__dirname, filepath));
const inputArgs = inputFixtures.map((filename) => ['--input', filename]).flat();

const rootPath = path.resolve(__dirname, '../../../../');
const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));
const webpackUIFixture = path.join(rootPath, 'test/fixtures/report-writer/injectable.js');

fs.mkdirSync(outputDir, { recursive: true });

jest.mock('fs', () => {
  const webpackUIPath = require.resolve('@statoscope/webpack-ui');
  const ofs = jest.requireActual('fs');
  return {
    ...ofs,
    readFile(name: string, ...args: unknown[]): unknown {
      if (path.resolve(name) === webpackUIPath) {
        name = webpackUIFixture;
      }

      return ofs.readFile(name, ...args);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    readFileSync(name: string, ...args: unknown[]): unknown {
      if (path.resolve(name) === webpackUIPath) {
        name = webpackUIFixture;
      }

      return ofs.readFileSync(name, ...args);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    createReadStream(name: string, ...args: unknown[]): unknown {
      if (path.resolve(name) === webpackUIPath) {
        name = webpackUIFixture;
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
