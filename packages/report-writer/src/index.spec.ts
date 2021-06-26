import fs from 'fs';
import path from 'path';
import Writer from './';

const injectablePath = path.resolve(
  __dirname,
  '../../../test/fixtures/report-writer/injectable.js'
);
const sourcePath = path.resolve(
  __dirname,
  '../../../test/fixtures/report-writer/source.json'
);

const rootPath = path.resolve(__dirname, '../../..');
const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));

fs.mkdirSync(outputDir, { recursive: true });
test('should work', async () => {
  const outputFile = path.join(outputDir, `${Date.now()}.html`);
  const writer = new Writer({
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    init: function (foo) {
      console.log(foo);
    },
    scripts: [
      {
        type: 'path',
        path: injectablePath,
      },
      {
        type: 'raw',
        content: `console.log('hello from raw!');`,
      },
    ],
  });

  writer.addChunkWriter(fs.createReadStream(sourcePath), 'foo');
  writer.addChunkWriter(fs.createReadStream(sourcePath), 'bar');
  writer.getStream().pipe(fs.createWriteStream(outputFile));

  await writer.write();

  expect(fs.readFileSync(outputFile, 'utf8')).toMatchSnapshot();
});
