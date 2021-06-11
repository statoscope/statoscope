/* global Statoscope */

import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import open from 'open';
// @ts-ignore
import { stringifyStream } from '@discoveryjs/json-ext';
import HTMLWriter from '@statoscope/report-writer';
import { Compiler, Compilation } from 'webpack';

export type Options = {
  name?: string;
  saveTo?: string;
  saveStatsTo?: string;
  additionalStats?: string[];
  statsOptions?: Record<string, unknown>;
  watchMode?: boolean;
  open: false | 'dir' | 'file';
};

export default class StatoscopeWebpackPlugin {
  options: Options;
  saveToDir?: string;
  saveToFile?: string;

  constructor(options: Partial<Options> = {}) {
    this.options = {
      open: 'file',
      additionalStats: [],
      ...options,
    };

    if (!this.options.saveTo) {
      this.saveToDir = tmpdir();
    } else if (this.options.saveTo.endsWith('.html')) {
      this.saveToFile = this.options.saveTo;
    } else {
      this.saveToDir = this.options.saveTo;
    }
  }

  interpolate(string: string, compilation: Compilation, customName?: string): string {
    return string
      .replace(/\[name]/gi, customName || compilation.name || 'unnamed')
      .replace(/\[hash]/gi, compilation.hash || 'unknown');
  }

  apply(compiler: Compiler): void {
    const { options } = this;

    compiler.hooks.done.tapAsync('Statoscope Webpack Plugin', async (stats, cb) => {
      if (compiler.watchMode && options.watchMode !== true) {
        return cb();
      }

      // @ts-ignore
      const statsObj = stats.toJson(options.statsOptions || compiler.options.stats);
      statsObj.name = options.name || statsObj.name || stats.compilation.name;
      const htmlPath =
        this.saveToFile ||
        path.join(this.saveToDir as string, `statoscope-[name]-[hash].html`);
      const resolvedHtmlPath = path.resolve(
        this.interpolate(htmlPath, stats.compilation, statsObj.name)
      );
      const resolvedSaveStatsTo =
        options.saveStatsTo &&
        path.resolve(
          this.interpolate(options.saveStatsTo, stats.compilation, statsObj.name)
        );

      const webpackStatsStream = stringifyStream(statsObj) as Readable;
      const htmlWriter = new HTMLWriter({
        scripts: [require.resolve('@statoscope/webpack-ui')],
        init: function (data): void {
          // @ts-ignore
          Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
        },
      });

      htmlWriter.getStream().pipe(fs.createWriteStream(resolvedHtmlPath));
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

      try {
        await htmlWriter.write();

        if (resolvedSaveStatsTo) {
          const statsFileStream = fs.createWriteStream(resolvedSaveStatsTo);
          webpackStatsStream.pipe(statsFileStream);
        }

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
}
