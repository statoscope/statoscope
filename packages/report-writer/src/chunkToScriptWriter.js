/* eslint-env node */

const fs = require('fs');
const { Transform } = require('stream');
const makeWriter = require('./writer');

module.exports = function makeChunkToScript(jsonExtAPIName = 'jsonExtAPI') {
  return {
    preWriter: makeHeaderWriter(jsonExtAPIName),
    makeChunkWriter(source, id) {
      return makeChunkToScriptWriter(source, id);
    },
  };
};

function makeHeaderWriter(jsonExtAPIName) {
  return makeWriter(async (write) => {
    await write(`
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
      
      const ${jsonExtAPIName} = _makeJsonExtAPI();
    </script>
  `);
  });
}

function makeChunkToScriptWriter(source, id) {
  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      callback(
        null,
        `<script type="text/plain" data-id=${JSON.stringify(
          id
        )}>${chunk.toString().replace(/<([!/])/g, '<\\\\$1')}</script>`
      );
    },
  });

  source.pipe(transformer);

  return makeWriter(async (write, pipeFrom) => {
    await pipeFrom(transformer);
  });
}
