/* eslint-env node */

const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const open = require('open');
const { stringifyStream } = require('@discoveryjs/json-ext');
const HTMLWriter = require('./htmlWriter');

/**
 * @typedef {Object} Options
 * @property {string} [name]
 * @property {string} [saveTo]
 * @property {string} [saveStatsTo]
 * @property {string} [diffWith]
 * @property {false|'dir'|'file'} [open]
 */

module.exports = class StatoscopeWebpackPlugin {
  /**
   * @param {Options} [options=] options
   */
  constructor(options) {
    /**
     * @type {Options}
     */
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

      const webpackStatsStream = stringifyStream(statsObj);
      const htmlWriter = new HTMLWriter(htmlPath);

      htmlWriter.addChunkWriter(
        webpackStatsStream,
        options.saveStatsTo ? path.basename(options.saveStatsTo) : 'stats.json'
      );

      if (options.diffWith) {
        const stream = fs.createReadStream(options.diffWith);
        htmlWriter.addChunkWriter(stream, path.basename(options.diffWith));
      }

      if (options.saveStatsTo) {
        const statsFileStream = fs.createWriteStream(options.saveStatsTo);
        webpackStatsStream.pipe(statsFileStream);
      }

      try {
        await htmlWriter.write();

        if (options.open) {
          if (options.open === 'file') {
            open(htmlPath);
          } else {
            open(path.dirname(htmlPath));
          }
        }

        cb();
      } catch (e) {
        cb(e);
      }
    });
  }
};
