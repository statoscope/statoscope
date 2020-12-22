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
 * @property {string[]} [additionalStats]
 * @property {Object} [statsOptions]
 * @property {boolean} [watchMode]
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

  interpolate(string, compilation, customName) {
    return string
      .replace(/\[name]/gi, customName || compilation.name || 'unnamed')
      .replace(/\[hash]/gi, compilation.hash);
  }

  apply(compiler) {
    const { options } = this;

    compiler.hooks.done.tapAsync('Statoscope Webpack Plugin', async (stats, cb) => {
      if (compiler.watchMode && options.watchMode !== true) {
        return cb();
      }

      const statsObj = stats.toJson(options.statsOptions || compiler.options.stats);
      statsObj.name = options.name || statsObj.name || stats.compilation.name;
      const htmlPath =
        options.saveToFile ||
        path.join(options.saveToDir, `statoscope-[name]-[hash].html`);
      const resolvedHtmlPath = path.resolve(
        this.interpolate(htmlPath, stats.compilation, statsObj.name)
      );
      const resolvedSaveStatsTo =
        options.saveStatsTo &&
        path.resolve(
          this.interpolate(options.saveStatsTo, stats.compilation, statsObj.name)
        );

      const webpackStatsStream = stringifyStream(statsObj);
      const htmlWriter = new HTMLWriter(resolvedHtmlPath);

      htmlWriter.addChunkWriter(
        webpackStatsStream,
        resolvedSaveStatsTo ? path.basename(resolvedSaveStatsTo) : 'stats.json'
      );

      if (options.additionalStats) {
        for (const statsPath of options.additionalStats) {
          const resolvedStatsPath = path.resolve(statsPath);
          if (resolvedStatsPath === resolvedSaveStatsTo) {
            continue;
          }

          const stream = fs.createReadStream(resolvedStatsPath);
          htmlWriter.addChunkWriter(stream, path.basename(resolvedStatsPath));
        }
      }

      if (resolvedSaveStatsTo) {
        const statsFileStream = fs.createWriteStream(resolvedSaveStatsTo);
        webpackStatsStream.pipe(statsFileStream);
      }

      try {
        await htmlWriter.write();

        if (options.open) {
          if (options.open === 'file') {
            open(resolvedHtmlPath);
          } else {
            open(path.dirname(resolvedHtmlPath));
          }
        }

        cb();
      } catch (e) {
        cb(e);
      }
    });
  }
};
