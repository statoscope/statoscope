import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import yargs from 'yargs';
import generate from './generate';

const inputFixtures = [
  '../../../../test/bundles/simple/stats-dev.json',
  '../../../../test/bundles/simple/stats-prod.json',
].map((filepath) => path.resolve(__dirname, filepath));
const inputArgs = inputFixtures.map((filename) => ['--input', filename]).flat();

const rootPath = path.resolve(__dirname, '../../../../');
const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));

fs.mkdirSync(outputDir, { recursive: true });

test('should work', async () => {
  const outputPath = path.join(outputDir, `${Date.now()}.html`);
  let y = yargs(['generate', ...inputArgs, '--output', outputPath]);

  y = generate(y);
  y.fail((_, error) => {
    console.error(error);
  });

  await y.argv;

  expect(
    crypto.createHash('md5').update(fs.readFileSync(outputPath)).digest('hex')
  ).toMatchInlineSnapshot(`"f2c42726d7a94fd5a79cc7197db099c0"`);
});
