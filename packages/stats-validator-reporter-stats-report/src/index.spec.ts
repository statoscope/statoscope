import path from 'path';
import fs from 'fs';
import Validator from '../../../packages/stats-validator';
import Reporter from './';

const rootPath = path.resolve(__dirname, '../../..');
const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));

test('should work', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    validate: {
      rules: {
        'webpack/restricted-modules': ['error', [/\.\/src/]],
        'webpack/restricted-packages': ['error', ['foo']],
      },
    },
  });
  const result = await validator.validate(
    require.resolve('../../../test/bundles/simple/stats-prod.json')
  );
  let saveReportTo = path.join(outputDir, 'should-work.html');
  let reporter = new Reporter({
    saveReportTo,
  });
  await reporter.run(result);
  expect(fs.existsSync(saveReportTo)).toBe(true);

  let saveStatsTo = path.join(outputDir, 'should-work-2.json');
  saveReportTo = path.join(outputDir, 'should-work-2.html');
  reporter = new Reporter({
    saveReportTo,
    saveStatsTo,
  });
  await reporter.run(result);
  expect(fs.existsSync(saveStatsTo)).toBe(true);
  expect(fs.existsSync(saveReportTo)).toBe(true);

  saveStatsTo = path.join(outputDir, 'should-work-3.json');
  saveReportTo = path.join(outputDir, 'should-work-3.html');
  reporter = new Reporter({
    saveReportTo,
    saveStatsTo,
    saveOnlyStats: true,
  });
  await reporter.run(result);
  expect(fs.existsSync(saveStatsTo)).toBe(true);
  expect(fs.existsSync(saveReportTo)).toBe(false);
});
