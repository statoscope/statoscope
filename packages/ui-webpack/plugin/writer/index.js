/* eslint-env node */

const { PassThrough, Stream } = require('stream');
const { promisify } = require('util');

function makeWriteFn(stream) {
  return promisify(stream.write.bind(stream));
}

function makeEndFn(stream) {
  return promisify(stream.end.bind(stream));
}

function makePipeFromFn(stream) {
  return (pipeFromStreamOrWriter) => {
    let pipeFromStream = pipeFromStreamOrWriter;

    if (!(pipeFromStreamOrWriter instanceof Stream)) {
      pipeFromStream = pipeFromStreamOrWriter.getStream();
      pipeFromStreamOrWriter.write();
    }

    return new Promise((resolve, reject) => {
      if (!pipeFromStream.readable && !pipeFromStream.writable) {
        return resolve();
      }

      pipeFromStream.pipe(stream, { end: false });
      pipeFromStream.on('end', (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  };
}

module.exports = function makeWriter(writer) {
  const stream = new PassThrough();
  let started = false;

  return {
    async write(options = {}) {
      if (started) {
        return;
      }

      started = true;
      await writer(makeWriteFn(stream), makePipeFromFn(stream), makeEndFn(stream));

      if (options.end !== false && (stream.readable || stream.writable)) {
        await promisify(stream.end.bind(stream))();
      }
    },
    getStream() {
      return stream;
    },
  };
};
