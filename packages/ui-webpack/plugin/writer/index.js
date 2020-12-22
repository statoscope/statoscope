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
  return (source) => {
    source = Array.isArray(source) ? source : [source];

    return Promise.all(
      source.map((streamOrWriter) => {
        let sourceStream = streamOrWriter;

        if (!(streamOrWriter instanceof Stream)) {
          sourceStream = streamOrWriter.getStream();
          streamOrWriter.write();
        }

        return new Promise((resolve, reject) => {
          if (!sourceStream.readable && !sourceStream.writable) {
            return resolve();
          }

          sourceStream.pipe(stream, { end: false });
          sourceStream.once('end', resolve);
          sourceStream.once('error', reject);
        });
      })
    );
  };
}

module.exports = function makeWriter(writer) {
  const stream = new PassThrough({});
  let started = false;

  stream.setMaxListeners(Infinity);

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
