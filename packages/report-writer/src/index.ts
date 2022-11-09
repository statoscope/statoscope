import fs from 'fs';
import { PassThrough, Readable, Writable } from 'stream';
import makeChunkToScriptWriter from './chunkToScriptWriter';

export { encode as encodeBinaryJSON } from './binary-json';

export type InitArg = { id: string; data: unknown }[];
export type AssetItem =
  | string
  | {
      type: 'path';
      path: string;
    }
  | { type: 'cjs'; path: string; name: string }
  | { type: 'raw'; content: string };
export type ScriptItem = AssetItem;
export type Options = {
  scripts?: ScriptItem[];
  html?: string[];
  init: string | ((data: InitArg) => void);
  jsonExtAPIName?: string;
  dataCompression?: boolean;
};

const scriptsToInject: ScriptItem[] = [
  {
    type: 'path',
    path: require.resolve('@discoveryjs/json-ext/dist/json-ext.min.js'),
  },
  {
    type: 'cjs',
    path: require.resolve('pako/dist/pako.es5.min.js'),
    name: 'Pako',
  },
  {
    type: 'cjs',
    path: require.resolve('./binary-json'),
    name: 'BinaryJSON',
  },
];

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

  let content: string;

  if (asset.type === 'path') {
    content = fs.readFileSync(require.resolve(asset.path), 'utf8');
  } else if (asset.type === 'raw') {
    content = asset.content;
  } else if (asset.type === 'cjs') {
    content = fs.readFileSync(require.resolve(asset.path), 'utf8');
    content = `
    window['${asset.name}'] = (() => {
      const exports = {};
      const module = { exports };
      ((module, exports) => {
        ${content}
      })(module, exports);
      return module.exports;
    })();
    `;
  } else {
    throw new Error('Unknown type');
  }

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
        font-family: Helvetica, sans-serif;
      }
      
      #loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
      }
      
      .wrapper {
        position: relative;
        top: 20%;
        width: 10vw;
        height: 10vw;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
      }
      
      .logo > svg {
        width: 100%;
        height: 100%;
      }
      
      #stage {
        font-size: 16px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div id="loading">
      <div class="wrapper">
        <div class="logo">
          <svg width="144" height="144" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="a" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="144" height="144"><circle cx="72" cy="72" r="72" fill="#fff"/></mask><g mask="url(#a)"><path d="M144 0H0v144h144V0Z" fill="#10255F"/><rect x="-67.999" y="-92" width="232" height="48" rx="24" transform="rotate(30 -68 -92)" fill="#4581B7"/><rect x="-22.718" y="-10.43" width="232" height="48" rx="24" transform="rotate(30 -22.718 -10.43)" fill="#5491C7"/><rect x="39.885" y="81.139" width="232" height="48" rx="24" transform="rotate(30 39.885 81.14)" fill="#4581B7"/></g></svg>
        </div>
        <div id="stage">Loading...</div>
      </div>
    </div>
    ${
      [...(options.scripts ?? []), ...scriptsToInject]
        ?.map((item) => handleAsset('script', item))
        .join('\n') ?? ''
    }
    <script>
      const stage = document.querySelector('#stage');
      
      function setStage(name, fn) {
        stage.textContent = \`\${name}...\`;
        requestAnimationFrame(() => {
          setTimeout(fn);
        });
      }
    
      function _makeJsonExtAPI() {
        const jsonExtData = new Object(null);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('');
        const charIndex = chars.reduce(function(res, item, index){
          res[item] = index;
          return res;
        }, {});
        
        function decodeFromBase64(input) {
          input = input.replace(/[^a-zA-Z0-9\\+\\/]/g, '');
      
          const output = [];
          let len = input.length;
          let i = 0;
          let chr1;
          let chr2;
          let chr3;
          let enc1;
          let enc2;
          let enc3;
          let enc4;
      
          // decode
          while (i < len)
          {
            enc1 = charIndex[input.charAt(i++)];
            enc2 = charIndex[input.charAt(i++)];
            enc3 = charIndex[input.charAt(i++)];
            enc4 = charIndex[input.charAt(i++)];
      
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
      
            output.push(chr1, chr2, chr3);
          }
      
          if (enc3 == null || enc3 == 64) output.pop();
          if (enc4 == null || enc4 == 64) output.pop();
      
          return output;
        }
      
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
                if (${JSON.stringify(options.dataCompression ?? true)} === false) {
                  return jsonExt.parseChunked(() => chunks).then((data) => ({ id, data }));
                }
                
                const gzipped = decodeFromBase64(chunks.join(''));
                const gzippedBuffer = Uint8Array.from(gzipped);
                const decodedBuffer = Pako.inflate(gzippedBuffer);
                const data = BinaryJSON.decode(decodedBuffer);
                return { id, data };
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
      setStage('Parsing', () => {
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
            setStage('Initialization', () => {
              initFunction(items);
              document.querySelector('#loading').remove();
            });
          });
      })
    </script>
  </body>
</html>
`);
}
