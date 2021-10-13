import path from 'path';
import { spawn } from 'child_process';

const inputFixtures = ['../../../../test/bundles/v5/simple/stats-prod.json'].map(
  (filepath) => path.resolve(__dirname, filepath)
);
const inputArgs = inputFixtures.map((filename) => ['--input', filename]).flat();

test('should work', async () => {
  const proc = spawn(path.resolve(__dirname, '../../bin/cli.js'), [
    'query',
    ...inputArgs,
    '--query',
    'compilations.modules.size()',
  ]);

  return new Promise((resolve, reject) => {
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];
    proc.stdout?.on('data', (data) => stdoutLines.push(data.toString()));
    proc.stderr?.on('data', (data) => stderrLines.push(data.toString()));
    proc.on('exit', (code) => {
      if (!code) {
        expect(stdoutLines).toMatchInlineSnapshot(`
Array [
  "24",
]
`);
        resolve(void 0);
      } else {
        console.error(stderrLines);
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
});
