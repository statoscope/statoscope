import fs from 'fs';
import { PassThrough, Readable, Writable } from 'stream';
import { promisify } from 'util';
import makeChunkToScriptWriter from './chunkToScriptWriter';

export type InitArg = { id: string; data: unknown }[];
export type Options = {
  scripts: string[];
  init: (data: InitArg) => void;
  jsonExtAPIName?: string;
};

export default class HTMLWriter {
  options: Options;
  chunkWriters: Array<{ id: string; stream: Readable }>;
  stream: PassThrough;

  constructor(options: Options) {
    this.options = {
      ...options,
      jsonExtAPIName: options.jsonExtAPIName || 'jsonExtAPIName',
    };
    this.stream = new PassThrough();
    this.chunkWriters = [];
  }

  getStream(): Readable {
    return this.stream;
  }

  async write(): Promise<void> {
    await writeHeader(this.stream, this.options);
    for (const writer of this.chunkWriters) {
      await makeChunkToScriptWriter(writer.stream, this.stream, writer.id);
    }
    await writeFooter(this.stream, this.options);
  }

  addChunkWriter(source: Readable, id: string): void {
    this.chunkWriters.push({ stream: source, id });
  }
}

async function writeHeader(stream: Writable, options: Options): Promise<void> {
  const write: (chunk: string) => Promise<void> = promisify(stream.write.bind(stream));
  await write(`
<html>
  <head>
      <meta charset="UTF-8">
      <script>
        ${options.scripts.map((filename) =>
          fs.readFileSync(require.resolve(filename), 'utf8')
        )}
      </script>
      <script>
      ${fs.readFileSync(
        require.resolve('@discoveryjs/json-ext/dist/json-ext.min.js'),
        'utf8'
      )}
    </script>
    <script>
      function _makeJsonExtAPI() {
        const jsonExtData = new Object(null);
      
        return {
          getData() {
            return jsonExtData;
          },
          pushChunk(id, chunk) {
            jsonExtData[id] = jsonExtData[id] || [];
            jsonExtData[id].push(chunk);
          },
          parse() {
            return Promise.all(
              Object.entries(jsonExtData).map(([id, chunks]) => {
                return jsonExt.parseChunked(() => chunks).then((data) => ({ id, data }));
              })
            );
          },
        };
      }
      
      const ${options.jsonExtAPIName} = _makeJsonExtAPI();
    </script>
    
    <style>
        html, body {
          padding: 0;
          margin: 0;
          height: 100%;
          border: none;
          -webkit-text-size-adjust: 100%;
        }
      </style>
  </head>
  <body>
    <div id="loading">Loading...</div>
`);
}

async function writeFooter(stream: Writable, options: Options): Promise<void> {
  const write: (chunk: string) => Promise<void> = promisify(stream.write.bind(stream));
  await write(`
    <script>
        for (const element of document.querySelectorAll('script')) {
          if(element.dataset.id) {
            ${options.jsonExtAPIName}.pushChunk(element.dataset.id, element.innerText);
            // cleanup script-tags to free memory
            element.remove();
          }
        }
        
        const initFunction = ${options.init};
        
        ${options.jsonExtAPIName}.parse()
          .then(items => {
            initFunction(items);
            document.querySelector('#loading').remove();
          });
    </script>
  </body>
</html>
`);
}
