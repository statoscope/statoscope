/* eslint-env node */

const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const open = require('open');
const { stringifyStream } = require('@discoveryjs/json-ext');

function saveStats(stats, to) {
  return new Promise((resolve, reject) => {
    stringifyStream(stats)
      .pipe(fs.createWriteStream(to, { flags: 'a' }))
      .on('finish', (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
  });
}

module.exports = class StatoscopeWebpackPlugin {
  constructor(options) {
    this.options = { ...options };

    this.options.open = this.options.open === undefined ? 'file' : this.options.open;

    if (!this.options.saveTo) {
      this.options.saveToDir = tmpdir();
    } else if (this.options.saveTo.endsWith('.html')) {
      this.options.saveToFile = this.options.saveTo;
    } else {
      this.options.saveToDir = this.options.saveTo;
    }
  }

  apply(compiler) {
    const { options } = this;

    compiler.hooks.done.tapAsync('Statoscope Webpack Plugin', async (stats, cb) => {
      const statsObj = stats.toJson(compiler.options.stats);
      const name = options.name || stats.compilation.name || stats.hash.slice(0, 7);
      const htmlPath =
        options.saveToFile || path.join(options.saveToDir, `statoscope-${name}.html`);

      statsObj.name = options.name || statsObj.name || stats.compilation.name;

      fs.writeFileSync(
        htmlPath,
        `
<html>
  <head>
      <meta charset="UTF-8">
      <script>
        ${fs.readFileSync(require.resolve('./dist/main.js'), 'utf8')}
      </script>
  </head>
  <body>
    <script>
      const data = 
`
      );

      await saveStats(statsObj, htmlPath);

      fs.writeFileSync(
        htmlPath,
        `
      ;
      Statoscope.default({ name: "stats.json", data });
    </script>
  </body>
</html>`,
        { flag: 'a' }
      );

      if (options.open) {
        if (options.open === 'file') {
          open(htmlPath);
        } else {
          open(path.dirname(htmlPath));
        }
      }

      cb();
    });
  }
};
