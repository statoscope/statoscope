import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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
  for (const report of reports) {
    const proc = spawn(path.resolve(__dirname, '../../bin/cli.js'), [
      'inject-report',
      '--input',
      path.join(statsDir, filename),
      '--report',
      report,
    ]);

    const output = await new Promise((resolve, reject) => {
      const stdoutLines: string[] = [];
      const stderrLines: string[] = [];
      proc.stdout?.on('data', (data) => stdoutLines.push(data.toString()));
      proc.stderr?.on('data', (data) => stderrLines.push(data.toString()));
      proc.on('exit', (code) => {
        if (!code) {
          resolve(stdoutLines);
        } else {
          console.error(stderrLines);
          reject(new Error(`Exit code ${code}`));
        }
      });
    });

    expect(output).toMatchSnapshot();
  }
});
