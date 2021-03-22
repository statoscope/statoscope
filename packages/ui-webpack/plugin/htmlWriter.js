/* eslint-env node */

const fs = require('fs');
const makeWriter = require('./writer');
const chunkToScriptWriter = require('./chunkToScriptWriter');

module.exports = class HTMLWriter {
  constructor(filename) {
    this.stream = fs.createWriteStream(filename);
    this.chunkWriter = chunkToScriptWriter('jsonExtAPI');
    this.chunkWriters = [];
    this.preWriter = makePreWriter(this.chunkWriter.preWriter);
    this.postWriter = makePostWriter('jsonExtAPI');
    this.writer = makeWriter(async (write, pipeFrom) => {
      await pipeFrom(this.preWriter);
      await pipeFrom(this.chunkWriters);
      await pipeFrom(this.postWriter);
    });
    this.writer.getStream().pipe(this.stream);
  }

  write() {
    return this.writer.write();
  }

  addChunkWriter(source, id) {
    this.chunkWriters.push(this.chunkWriter.makeChunkWriter(source, id));
  }
};

function makePreWriter(preSource) {
  return makeWriter(async (write, pipeFrom) => {
    await write(`
<html>
  <head>
      <meta charset="UTF-8">
      <script>
        ${fs.readFileSync(require.resolve('../dist/main.js'), 'utf8')}
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

function makePostWriter(jsonExtAPIName) {
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
        
        ${jsonExtAPIName}.parse()
          .then(items => {
            Statoscope.default(items.map(item => ({ name: item.id, data: item.data })));
            document.querySelector('#loading').remove();
          });
    </script>
  </body>
</html>`);
  });
}
