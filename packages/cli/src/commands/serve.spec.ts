import fs from 'fs';
import path from 'path';
import http from 'http';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import yargs from 'yargs';
import generate from './generate';

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
const customReportsConfigSrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/generate/custom-reports-config.js'
);

const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));

const dateSuffix = Date.now();

fs.mkdirSync(outputDir, { recursive: true });

/**
 * Run generate CLI command and return the output file as a string.
 * Assume that command line param names are the same between `generate` and `serve` commands.
 */
async function runGenerateCli(args: string[]): Promise<string> {
  const outputPath = path.join(outputDir, `single-input-${dateSuffix}.html`);

  let y = yargs(['generate', ...args, '--output', outputPath]);

  y = generate(y);

  y.fail((_, error) => {
    console.error(error);
  });

  await y.argv;

  return fs.readFileSync(outputPath, 'utf8');
}

/**
 * Spawn a child process, run serve command and resolve with the process once server is up.
 * Have to use child processes cause otherwise there is no way to stop running webserver without
 * terminating the main test process itself.
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

/**
 * Load the html from url provided and return it as a string.
 */
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

    // terminates the child including descendant processes
    // @ts-ignore
    process.kill(-serveProcess.pid);
  });

  const tests = [
    {
      name: 'single input',
      args: ['--input', inputASrc],
    },
    {
      name: 'multiple inputs',
      args: ['--input', inputASrc, inputBSrc],
    },
    {
      name: 'single input with a reference',
      args: ['--input', inputASrc, '--reference', inputBSrc],
    },
    {
      name: 'single input with single custom report in json file',
      args: ['--input', inputASrc, '--custom-report', customReportMultipleSrc],
    },
    {
      name: 'single input with multiple custom report json files',
      args: ['--input', inputASrc, '--custom-report', customReportASrc, customReportBSrc],
    },
    {
      name: 'single input with custom reports via config file',
      args: ['--input', inputASrc, '--config', customReportsConfigSrc],
    },
  ];

  test.each(tests)(`$name`, async ({ args }) => {
    serveProcess = await runCliServeAsChildProcess(args);

    const promises = [];

    // run these in parallel
    promises.push(loadHtmlByUrl(reportUrl), runGenerateCli(args));

    const [fromServer, fromFile] = await Promise.all(promises);

    expect(fromServer).toMatch(fromFile);
  });
});
