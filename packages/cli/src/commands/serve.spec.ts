import fs from 'fs';
import path from 'path';
import http from 'http';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

const rootPath = path.resolve(__dirname, '../../../../');
const inputASrc = path.resolve(
  __dirname,
  '../../../../test/bundles/v5/simple/stats-prod.json'
);
const inputBSrc = path.resolve(
  __dirname,
  '../../../../test/bundles/v5/simple/stats-dev.json'
);

const cliIndexSrc = path.resolve(__dirname, '../index.ts');
const reportUrl = 'http://localhost:8080/';

const customReportMultipleSrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/reports/multiple-reports.json'
);
const customReportASrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/reports/single-report-a.json'
);
const customReportBSrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/reports/single-report-b.json'
);

const customReportConfigSrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/generate/custom-reports-config.js'
);

const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));
const webpackUIFixture = path.join(rootPath, 'test/fixtures/report-writer/injectable.js');
const statsFixture = path.join(rootPath, 'test/fixtures/report-writer/source.json');

const mockedContent = new Map([
  [require.resolve('@statoscope/webpack-ui'), webpackUIFixture],
  [require.resolve('../../../../test/bundles/v5/simple/stats-prod.json'), statsFixture],
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
    readFileSync(name: string, ...args: unknown[]): unknown {
      const mocked = mockedContent.get(path.resolve(name));

      if (mocked) {
        name = mocked;
      }

      return ofs.readFileSync(name, ...args);
    },
    createReadStream(name: string, ...args: unknown[]): unknown {
      const mocked = mockedContent.get(path.resolve(name));

      if (mocked) {
        name = mocked;
      }

      return ofs.createReadStream(name, ...args);
    },
  };
});

/**
 * Spawn a child process, run serve command and resolve with the process once server is up.
 */
async function runCliServeAsChildProcess(
  args: string[] = []
): Promise<ChildProcessWithoutNullStreams> {
  const webserverIsUpMessageRegex = /Statoscope server listen at/i;
  const reportGeneratedMessageRegex = /Statoscope report generated to/i;

  let resolve: (value: ChildProcessWithoutNullStreams) => void;
  let reject: (value: string) => void;

  const promise: Promise<ChildProcessWithoutNullStreams> = new Promise(
    (_resolve_, _reject_) => {
      resolve = _resolve_;
      reject = _reject_;
    }
  );

  const child = spawn('npx', ['ts-node', cliIndexSrc, 'serve', ...args], {
    detached: true,
  });

  child.stdout.on('data', (string) => {
    // proceed with the test after getting the match
    if (webserverIsUpMessageRegex.test(string)) {
      resolve(child);
    } else if (reportGeneratedMessageRegex.test(string)) {
      // proxy the log for easier debugging
      console.log(`${string}`);
    }
  });

  child.stderr.on('data', (err) => {
    reject(`${err}`);
    // @ts-ignore
    process.kill(-child.pid);
  });

  return promise;
}

async function loadHtmlByUrl(url: string): Promise<string> {
  let resolve: (value: string) => void;
  let reject: (value: string) => void;

  const promise: Promise<string> = new Promise((_resolve_, _reject_) => {
    resolve = _resolve_;
    reject = _reject_;
  });

  const request = http.get(url, (resp) => {
    let body = '';

    resp.on('data', (chunk) => {
      body += chunk;
    });

    resp.on('end', () => {
      resolve(body);
    });
  });

  request.on('error', (e) => {
    reject(e.message);
  });

  return promise;
}

describe('serve CLI command', () => {
  let serveProcess: ChildProcessWithoutNullStreams | null = null;

  beforeEach(() => {
    serveProcess = null;
  });

  afterEach(() => {
    if (!serveProcess) {
      return;
    }

    // @ts-ignore
    process.kill(-serveProcess.pid);
  });

  test('single input', async () => {
    serveProcess = await runCliServeAsChildProcess(['--input', inputASrc]);

    const html = await loadHtmlByUrl(reportUrl);

    expect(html).toMatchSnapshot();
  });

  test('multiple inputs', async () => {
    serveProcess = await runCliServeAsChildProcess(['--input', inputASrc, inputBSrc]);

    const html = await loadHtmlByUrl(reportUrl);

    expect(html).toMatchSnapshot();
  });

  test('single input with a reference', async () => {
    serveProcess = await runCliServeAsChildProcess([
      '--input',
      inputASrc,
      '--reference',
      inputBSrc,
    ]);

    const html = await loadHtmlByUrl(reportUrl);

    expect(html).toMatchSnapshot();
  });

  test('single input with single custom report in json file', async () => {
    serveProcess = await runCliServeAsChildProcess([
      '--input',
      inputASrc,
      '--custom-report',
      customReportMultipleSrc,
    ]);

    const html = await loadHtmlByUrl(reportUrl);

    expect(html).toMatchSnapshot();
  });

  test('single input with multiple custom report json files', async () => {
    serveProcess = await runCliServeAsChildProcess([
      '--input',
      inputASrc,
      '--custom-report',
      customReportASrc,
      customReportBSrc,
    ]);

    const html = await loadHtmlByUrl(reportUrl);

    expect(html).toMatchSnapshot();
  });

  test('single input with custom reports via config file', async () => {
    serveProcess = await runCliServeAsChildProcess([
      '--input',
      inputASrc,
      '--config',
      customReportConfigSrc,
    ]);

    const html = await loadHtmlByUrl(reportUrl);

    expect(html).toMatchSnapshot();
  });
});
