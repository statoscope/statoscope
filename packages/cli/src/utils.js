const fs = require('fs');
const os = require('os');
const path = require('path');
const HTMLWriter = require('@statoscope/report-writer');

async function transform(from, to) {
  const id = from.length === 1 ? path.basename(from[0], '.json') : Date.now();
  to = to || path.join(os.tmpdir(), `statoscope-report-${id}.html`);
  const htmlWriter = new HTMLWriter({
    scripts: [require.resolve('@statoscope/webpack-ui')],
    init: function (data) {
      // eslint-disable-next-line
      Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
    },
  });

  for (const file of from) {
    const id = path.basename(file);
    htmlWriter.addChunkWriter(fs.createReadStream(file), id);
  }

  htmlWriter.getStream().pipe(fs.createWriteStream(to));

  await htmlWriter.write();
  return to;
}

module.exports.transform = transform;
