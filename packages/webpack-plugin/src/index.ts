/* global Statoscope */

import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import open from 'open';
// @ts-ignore
import { stringifyStream } from '@discoveryjs/json-ext';
import HTMLWriter from '@statoscope/report-writer';
import { Compilation, Compiler } from 'webpack';
import { StatsDescriptor } from '@statoscope/stats';
import statsPackage from '@statoscope/stats/package.json';
import { Extension } from '@statoscope/stats/spec/extension';
import WebpackCompressedExtension from '@statoscope/webpack-stats-extension-compressed';
import WebpackPackageInfoExtension from '@statoscope/webpack-stats-extension-package-info';
import { CompressFunction } from '@statoscope/stats-extension-compressed/dist/generator';
import Piper from '@statoscope/report-writer/dist/piper';

export type Options = {
  name?: string;
  saveTo?: string;
  saveStatsTo?: string;
  additionalStats?: string[];
  statsOptions?: Record<string, unknown>;
  watchMode?: boolean;
  open?: false | 'dir' | 'file';
  compressor?: false | 'gzip' | CompressFunction;
};

export type StatoscopeMeta = {
  descriptor: StatsDescriptor;
  extensions: Extension<unknown>[];
};

export default class StatoscopeWebpackPlugin {
  options: Options;
  saveToDir?: string;
  saveToFile?: string;

  constructor(options: Partial<Options> = {}) {
    this.options = {
      open: 'file',
      compressor: 'gzip',
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

    let packageInfoExtension: WebpackPackageInfoExtension | null = null;

    packageInfoExtension = new WebpackPackageInfoExtension();
    // @ts-ignore
    packageInfoExtension.handleCompiler(compiler);

    compiler.hooks.done.tapAsync('Statoscope Webpack Plugin', async (stats, cb) => {
      if (compiler.watchMode && options.watchMode !== true) {
        return cb();
      }

      // @ts-ignore
      const statsObj = stats.toJson(options.statsOptions || compiler.options.stats);
      statsObj.name = options.name || statsObj.name || stats.compilation.name;

      const statoscopeMeta: StatoscopeMeta = {
        descriptor: { name: statsPackage.name, version: statsPackage.version },
        extensions: [],
      };
      statsObj.__statoscope = statoscopeMeta;

      statoscopeMeta.extensions.push(packageInfoExtension!.get());

      if (this.options.compressor) {
        const compressedExtension = new WebpackCompressedExtension(
          this.options.compressor
        );
        // @ts-ignore
        await compressedExtension.handleCompilation(stats.compilation);
        statoscopeMeta.extensions.push(compressedExtension.get());
      }

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

      const webpackStatsStream = new Piper(stringifyStream(statsObj) as Readable);
      const htmlWriter = new HTMLWriter({
        scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
        init: function (data): void {
          // @ts-ignore
          Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
        },
      });

      htmlWriter.getStream().pipe(fs.createWriteStream(resolvedHtmlPath));
      htmlWriter.addChunkWriter(
        webpackStatsStream.getOutput(),
        resolvedSaveStatsTo ? path.basename(resolvedSaveStatsTo) : 'stats.json'
      );

      if (resolvedSaveStatsTo) {
        const statsFileStream = fs.createWriteStream(resolvedSaveStatsTo);
        webpackStatsStream.addConsumer(statsFileStream);
      }

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
        await Promise.all([webpackStatsStream.consume(), htmlWriter.write()]);

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
