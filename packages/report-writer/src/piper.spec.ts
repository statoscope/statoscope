import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import Piper from './piper';

const rootPath = path.resolve(__dirname, '../../..');
const outputDir = path.join(rootPath, 'test/temp', path.relative(rootPath, __filename));
const statsFixturePath = path.join(rootPath, 'test/bundles/simple/stats-dev.json');

fs.mkdirSync(outputDir, { recursive: true });

test('should work', async () => {
  const outputFile = path.join(outputDir, `${Date.now()}.txt`);
  const outputFile1 = path.join(outputDir, `${Date.now()}-1.txt`);
  const outputFile2 = path.join(outputDir, `${Date.now()}-2.txt`);
  let counter = 0;
  const source = new Readable({
    read(): void {
      if (counter < 5) {
        setTimeout(() => {
          counter++;
          this.push('foo');
        }, 200);
      } else {
        this.push(null);
      }
    },
  });
  const piper = new Piper(source);
  const outputStream1 = fs.createWriteStream(outputFile1);
  const outputStream2 = fs.createWriteStream(outputFile2);

  piper.addConsumer(outputStream1);
  piper.addConsumer(outputStream2);
  fs.createReadStream(statsFixturePath).pipe(outputStream2, { end: false });
  piper.getOutput().pipe(fs.createWriteStream(outputFile));
  await piper.consume();
  expect(fs.readFileSync(outputFile, 'utf8')).toMatchSnapshot();
  expect(fs.readFileSync(outputFile1, 'utf8')).toMatchSnapshot();
  expect(fs.readFileSync(outputFile2, 'utf8')).toMatchSnapshot();
});
