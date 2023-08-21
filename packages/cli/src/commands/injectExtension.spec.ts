import fs from 'fs';
import path from 'path';
import os from 'os';
import yargs from 'yargs';
import injectExtension from './injectExtension';

const rootPath = path.resolve(__dirname, '../../../../');
const outputDir = path.join(
  rootPath,
  'test/temp',
  Date.now().toString(),
  path.relative(rootPath, __filename)
);
const statsDir = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/stats/'
);
const extDir = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/extensions/'
);
const stats = [
  'stats-with-reports.json',
  'stats-without-extensions.json',
  'stats-without-meta.json',
];
const exts = ['multiple-extensions.json', 'single-extension-a.json'];

fs.mkdirSync(outputDir, { recursive: true });

jest.mock('../../package.json', () => ({
  ...jest.requireActual('../../package.json'),
  version: '8.8.8',
}));
jest.mock('@statoscope/stats-extension-custom-reports/package.json', () => ({
  ...jest.requireActual('@statoscope/stats-extension-custom-reports/package.json'),
  version: '8.8.8',
}));

const output: string[] = [];
// eslint-disable-next-line
let consoleLogSpy: any = null;

beforeEach(() => {
  const originalWrite = process.stdout.write.bind(process.stdout);
  consoleLogSpy = jest
    .spyOn(process.stdout, 'write')
    .mockImplementation((data, f, cb) => {
      output.push(
        String(data).replace(process.cwd(), '<pwd>').replace(os.tmpdir(), '<tmp>')
      );
      return originalWrite(data, f, cb);
    });
});

afterEach(() => {
  consoleLogSpy?.mockRestore();
  output.length = 0;
});

function getOutput(): unknown {
  return JSON.parse(output.join(''));
}

describe.each(stats)('%s,', (filename) => {
  test.each(exts)('%s,', async (ext) => {
    const statsPath = path.join(statsDir, filename);
    const extPath = path.join(extDir, ext);

    let y = yargs(['inject-extension', '--input', statsPath, '-e', extPath]);

    y = injectExtension(y);
    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(getOutput()).toMatchSnapshot();
  });
});
