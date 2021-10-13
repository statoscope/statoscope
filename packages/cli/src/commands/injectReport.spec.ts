import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import inject from './injectReport';

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
const stats = [
  'stats-with-reports.json',
  'stats-without-extensions.json',
  'stats-without-meta.json',
  'stats-without-reports.json',
];

fs.mkdirSync(outputDir, { recursive: true });

jest.mock('fs', () => {
  const ofs = jest.requireActual('fs');
  return {
    ...ofs,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    readFileSync(name: string, ...args: unknown[]): unknown {
      // eslint-disable-next-line eqeqeq
      if (name == '0') {
        return '';
      }
      return ofs.readFileSync(name, ...args);
    },
  };
});

const reports = [
  require.resolve(
    '../../../../test/fixtures/cli/injectReport/reports/single-report.json'
  ),
  require.resolve(
    '../../../../test/fixtures/cli/injectReport/reports/multiple-reports.json'
  ),
];

test.each(stats)('%s,', async (filename) => {
  const newFilename = path.join(outputDir, filename);
  fs.copyFileSync(path.join(statsDir, filename), newFilename);

  for (const report of reports) {
    const y = inject(yargs);
    y.fail((_, error) => {
      console.error(error);
    });

    await y.parse(['inject-report', '--input', newFilename, '--report', report]);

    expect(fs.readFileSync(newFilename, 'utf8')).toMatchSnapshot();
  }
});
