import fs from 'fs';
import { PassThrough, Readable, Writable } from 'stream';
import makeChunkToScriptWriter from './chunkToScriptWriter';

export type InitArg = { id: string; data: unknown }[];
export type AssetItem =
  | string
  | {
      type: 'path';
      path: string;
    }
  | { type: 'raw'; content: string };
export type ScriptItem = AssetItem;
export type Options = {
  scripts?: ScriptItem[];
  html?: string[];
  init: string | ((data: InitArg) => void);
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

    for (const writer of this.chunkWriters) {
      await makeChunkToScriptWriter(writer.stream, this.stream, writer.id);
    }

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

function handleAsset(type: 'script' | 'style', asset: AssetItem): string {
  if (typeof asset === 'string') {
    asset = { type: 'path', path: asset };
  }

  const content =
    asset.type === 'path'
      ? fs.readFileSync(require.resolve(asset.path), 'utf8')
      : asset.content;

  return `<${type}>${content}</${type}>`;
}

function writeHeader(stream: Writable, options: Options): void {
  stream.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      html, body {
        padding: 0;
        margin: 0;
        height: 100%;
        border: none;
        -webkit-text-size-adjust: 100%;
      }
      
      #loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
            -ms-flex-pack: center;
                justify-content: center;
      }
      
      .logo {
        position: relative;
        top: 20%;
        width: 10vw;
        height: 10vw;
      }
      
      .logo > svg {
        -webkit-animation: rotate 3s ease infinite;
                animation: rotate 3s ease infinite;
        width: 100%;
        height: 100%;
      }
      
      @-webkit-keyframes rotate {
        0% {
          -webkit-transform: rotate(0deg);
                  transform: rotate(0deg);
        }
        25% {
        }
        50% {
          -webkit-transform: rotate(1440deg);
                  transform: rotate(1440deg);
        }
        75% {
        }
        100% {
          -webkit-transform: rotate(0deg);
                  transform: rotate(0deg);
        }
      }
    </style>
  </head>
  <body>
    <div id="loading">
      <div class="logo">
        <svg width="144" height="144" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="a" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="144" height="144"><circle cx="72" cy="72" r="72" fill="#fff"/></mask><g mask="url(#a)"><path d="M144 0H0v144h144V0Z" fill="#10255F"/><rect x="-67.999" y="-92" width="232" height="48" rx="24" transform="rotate(30 -68 -92)" fill="#4581B7"/><rect x="-22.718" y="-10.43" width="232" height="48" rx="24" transform="rotate(30 -22.718 -10.43)" fill="#5491C7"/><rect x="39.885" y="81.139" width="232" height="48" rx="24" transform="rotate(30 39.885 81.14)" fill="#4581B7"/></g></svg>
      </div>
    </div>
    <script>
      ${fs.readFileSync(
        require.resolve('@discoveryjs/json-ext/dist/json-ext.min.js'),
        'utf8'
      )}
    </script>
    ${options.scripts?.map((item) => handleAsset('script', item)).join('\n') ?? ''}
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
