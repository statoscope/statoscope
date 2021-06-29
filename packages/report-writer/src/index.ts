import fs from 'fs';
import { PassThrough, Readable, Writable } from 'stream';
import makeChunkToScriptWriter from './chunkToScriptWriter';

export type InitArg = { id: string; data: unknown }[];
export type ScriptItem =
  | {
      type: 'path';
      path: string;
    }
  | { type: 'raw'; content: string };
export type Options = {
  scripts: ScriptItem[];
  init: (data: InitArg) => void;
  jsonExtAPIName?: string;
};

export default class HTMLWriter {
  options: Options;
  chunkWriters: Array<{ id: string; stream: Readable }>;
  stream: PassThrough = new PassThrough();

  constructor(options: Options) {
    this.options = {
      ...options,
      jsonExtAPIName: options.jsonExtAPIName || 'jsonExtAPIName',
    };
    this.stream.setMaxListeners(100);
    this.chunkWriters = [];
  }

  getStream(): Readable {
    return this.stream;
  }

  async write(): Promise<void> {
    writeHeader(this.stream, this.options);
    await Promise.all(
      this.chunkWriters.map((writer) =>
        makeChunkToScriptWriter(writer.stream, this.stream, writer.id)
      )
    );
    writeFooter(this.stream, this.options);
    this.stream.end();

    return new Promise((resolve, reject) => {
      this.stream.once('finish', resolve);
      this.stream.once('error', reject);
    });
  }

  addChunkWriter(source: Readable, id: string): void {
    this.chunkWriters.push({ stream: source, id });
  }
}

function writeHeader(stream: Writable, options: Options): void {
  stream.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <script>
      ${fs.readFileSync(
        require.resolve('@discoveryjs/json-ext/dist/json-ext.min.js'),
        'utf8'
      )}
    </script>
    ${options.scripts
      .map(
        (item) =>
          `<script>${
            item.type === 'path'
              ? fs.readFileSync(require.resolve(item.path), 'utf8')
              : item.content
          }</script>`
      )
      .join('\n')}
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
      
      #loading {
        margin: 5px;
        font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="loading">Loading...</div>
`);
}

function writeFooter(stream: Writable, options: Options): void {
  stream.write(`
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
