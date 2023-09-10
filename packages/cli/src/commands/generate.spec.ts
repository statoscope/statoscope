import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import generate from './generate';

const rootPath = path.resolve(__dirname, '../../../../');
const inputSrc = path.resolve(
  __dirname,
  '../../../../test/bundles/v5/simple/stats-prod.json',
);
const refSrc = path.resolve(
  __dirname,
  '../../../../test/bundles/v5/simple/stats-prod.json',
);

const customReportMultipleSrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/reports/multiple-reports.json',
);
const customReportASrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/reports/single-report-a.json',
);
const customReportBSrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/injectReport/reports/single-report-b.json',
);

const customReportsConfigSrc = path.resolve(
  __dirname,
  '../../../../test/fixtures/cli/generate/custom-reports-config.js',
);

const inputFixtures = [inputSrc, inputSrc, inputSrc, inputSrc];

const inputArgs = inputFixtures.map((filename) => ['--input', filename]).flat();

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
  const path = jest.requireActual('path');
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

jest.mock('../../package.json', () => ({
  ...jest.requireActual('../../package.json'),
  version: '8.8.8',
}));
jest.mock('@statoscope/stats-extension-custom-reports/package.json', () => ({
  ...jest.requireActual('@statoscope/stats-extension-custom-reports/package.json'),
  version: '8.8.8',
}));

const dateSuffix = Date.now();

describe('generate CLI command', () => {
  test('single input', async () => {
    const outputPath = path.join(outputDir, `single-input-${dateSuffix}.html`);
    let y = yargs(['generate', '--input', inputSrc, '--output', outputPath]);

    y = generate(y);

    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
  });

  test('multiple inputs', async () => {
    const outputPath = path.join(outputDir, `multiple-inputs-${dateSuffix}.html`);

    let y = yargs(['generate', ...inputArgs, '--output', outputPath]);

    y = generate(y);

    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
  });

  test('multiple inputs with no-compression', async () => {
    const outputPath = path.join(outputDir, `multiple-inputs-${dateSuffix}.html`);

    let y = yargs(['generate', ...inputArgs, '--output', outputPath, '--no-compression']);

    y = generate(y);

    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
  });

  test('single input with a reference', async () => {
    const outputPath = path.join(outputDir, `with-reference-${dateSuffix}.html`);

    let y = yargs([
      'generate',
      '--input',
      inputSrc,
      '--reference',
      refSrc,
      '--output',
      outputPath,
    ]);

    y = generate(y);

    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
  });

  test('single input with single custom report in json file', async () => {
    const outputPath = path.join(outputDir, `with-custom-report-${dateSuffix}.html`);

    let y = yargs([
      'generate',
      '--input',
      inputSrc,
      '--custom-report',
      customReportMultipleSrc,
      '--output',
      outputPath,
    ]);

    y = generate(y);

    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
  });

  test('single input with multiple custom report json files', async () => {
    const outputPath = path.join(outputDir, `with-custom-reports-${dateSuffix}.html`);

    let y = yargs([
      'generate',
      '--input',
      inputSrc,
      '--custom-report',
      customReportASrc,
      customReportBSrc,
      '--output',
      outputPath,
    ]);

    y = generate(y);

    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
  });

  test('single input with custom reports via config file', async () => {
    const outputPath = path.join(
      outputDir,
      `with-custom-reports-through-config-${dateSuffix}.html`,
    );

    let y = yargs([
      'generate',
      '--input',
      inputSrc,
      '--config',
      customReportsConfigSrc,
      '--output',
      outputPath,
    ]);

    y = generate(y);

    y.fail((_, error) => {
      console.error(error);
    });

    await y.argv;

    expect(fs.readFileSync(outputPath, 'utf8')).toMatchSnapshot();
  });
});
