/* eslint-env node */

const fs = require('fs');
const makeWriter = require('./writer');
const chunkToScriptWriter = require('./chunkToScriptWriter');

module.exports = class HTMLWriter {
  constructor(options) {
    const jsonExtAPIName = options.jsonExtAPIName || 'jsonExtAPIName';
    this.chunkWriter = chunkToScriptWriter(jsonExtAPIName);
    this.chunkWriters = [];
    this.preWriter = makePreWriter(this.chunkWriter.preWriter, options);
    this.postWriter = makePostWriter(jsonExtAPIName, options);
    this.writer = makeWriter(async (write, pipeFrom) => {
      await pipeFrom(this.preWriter);
      await pipeFrom(this.chunkWriters);
      await pipeFrom(this.postWriter);
    });
  }

  getStream() {
    return this.writer.getStream();
  }

  write() {
    return this.writer.write();
  }

  addChunkWriter(source, id) {
    this.chunkWriters.push(this.chunkWriter.makeChunkWriter(source, id));
  }
};

function makePreWriter(preSource, options) {
  return makeWriter(async (write, pipeFrom) => {
    await write(`
<html>
  <head>
      <meta charset="UTF-8">
      <script>
        ${options.scripts.map((filename) =>
          fs.readFileSync(require.resolve(filename), 'utf8')
        )}
      </script>
`);
    await pipeFrom(preSource);
    await write(`
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
    <div id="loading">Loading...</div>`);
  });
}

function makePostWriter(jsonExtAPIName, options) {
  return makeWriter(async (write) => {
    write(`
    <script>
        for (const element of document.querySelectorAll('script')) {
          if(element.dataset.id) {
            ${jsonExtAPIName}.pushChunk(element.dataset.id, element.innerText);
            // cleanup script-tags to free memory
            element.remove();
          }
        }
        
        const initFunction = ${options.init};
        
        ${jsonExtAPIName}.parse()
          .then(items => {
            initFunction(items);
            document.querySelector('#loading').remove();
          });
    </script>
  </body>
</html>`);
  });
}
