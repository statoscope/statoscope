import fs from 'fs';
import path from 'path';
import { mergeCustomReportsIntoCompilation } from '../utils';

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

jest.mock('../../package.json', () => ({
  ...jest.requireActual('../../package.json'),
  version: '8.8.8',
}));
jest.mock('@statoscope/stats-extension-custom-reports/package.json', () => ({
  ...jest.requireActual('@statoscope/stats-extension-custom-reports/package.json'),
  version: '8.8.8',
}));

const reports = [
  require.resolve(
    '../../../../test/fixtures/cli/injectReport/reports/single-report-a.json'
  ),
  require.resolve(
    '../../../../test/fixtures/cli/injectReport/reports/multiple-reports.json'
  ),
];

test.each(stats)('%s,', async (filename) => {
  for (const report of reports) {
    const parsed = JSON.parse(fs.readFileSync(path.join(statsDir, filename), 'utf-8'));
    const parsedReport = JSON.parse(fs.readFileSync(report, 'utf-8'));

    expect(
      await mergeCustomReportsIntoCompilation(parsed, [parsedReport].flat())
    ).toMatchSnapshot();
  }
});
