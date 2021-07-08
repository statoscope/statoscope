import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { Readable, Writable } from 'stream';
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

export type Options = {
  name?: string;
  saveReportTo?: string;
  // todo statoscope 6: remove
  saveTo?: string;
  saveStatsTo?: string;
  saveOnlyStats: boolean;
  additionalStats: string[];
  statsOptions?: Record<string, unknown>;
  watchMode: boolean;
  open: false | 'dir' | 'file';
  compressor: false | 'gzip' | CompressFunction;
};

export type StatoscopeMeta = {
  descriptor: StatsDescriptor;
  extensions: Extension<unknown>[];
};

export default class StatoscopeWebpackPlugin {
  options: Options;

  constructor(options: Partial<Options> = {}) {
    this.options = {
      open: 'file',
      compressor: 'gzip',
      additionalStats: [],
      saveOnlyStats: false,
      watchMode: false,
      ...options,
    };

    if (this.options.saveOnlyStats) {
      this.options.open = false;
    }

    this.options.saveReportTo ??= this.options.saveTo;
  }

  interpolate(string: string, compilation: Compilation, customName?: string): string {
    return string
      .replace(/\[name]/gi, customName || compilation.name || 'unnamed')
      .replace(/\[hash]/gi, compilation.hash || 'unknown');
  }

  apply(compiler: Compiler): void {
    const { options } = this;

    const packageInfoExtension = new WebpackPackageInfoExtension();
    // @ts-ignore
    packageInfoExtension.handleCompiler(compiler);

    compiler.hooks.done.tapAsync('Statoscope Webpack Plugin', async (stats, cb) => {
      if (compiler.watchMode && !options.watchMode) {
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

      statoscopeMeta.extensions.push(packageInfoExtension.get());

      if (this.options.compressor) {
        const compressedExtension = new WebpackCompressedExtension(
          this.options.compressor
        );
        // @ts-ignore
        await compressedExtension.handleCompilation(stats.compilation);
        statoscopeMeta.extensions.push(compressedExtension.get());
      }

      const webpackStatsStream = stringifyStream(statsObj);
      let statsFileOutputStream: Writable | undefined;
      let resolvedSaveStatsTo: string | undefined;

      if (options.saveStatsTo) {
        resolvedSaveStatsTo = path.resolve(
          this.interpolate(options.saveStatsTo, stats.compilation, statsObj.name)
        );
        fs.mkdirSync(path.dirname(resolvedSaveStatsTo), { recursive: true });
        statsFileOutputStream = fs.createWriteStream(resolvedSaveStatsTo);
        webpackStatsStream.pipe(statsFileOutputStream);
      }

      const statsForReport = this.getStatsForHTMLReport({
        filename: resolvedSaveStatsTo,
        stream: stringifyStream(statsObj),
      });
      const htmlReportPath = this.getHTMLReportPath();
      const resolvedHTMLReportPath = path.resolve(
        this.interpolate(htmlReportPath, stats.compilation, statsObj.name)
      );
      const htmlReport = this.makeReport(resolvedHTMLReportPath, statsForReport);

      try {
        await Promise.all([
          htmlReport.writer?.write(),
          waitStreamEnd(statsFileOutputStream),
          waitStreamEnd(htmlReport.stream),
        ]);

        if (options.open) {
          if (options.open === 'file') {
            open(resolvedHTMLReportPath);
          } else {
            open(path.dirname(resolvedHTMLReportPath));
          }
        }

        cb();
      } catch (e) {
        cb(e);
      }
    });
  }

  getStatsForHTMLReport(mainStats: {
    filename?: string;
    stream: Readable;
  }): Array<{ filename: string; stream: Readable }> {
    const mainStatsFilename = mainStats.filename
      ? path.basename(mainStats.filename)
      : 'stats.json';

    return [
      {
        filename: mainStatsFilename,
        stream: mainStats.stream,
      },
      ...this.options.additionalStats
        .map((statsPath) => {
          const filename = path.resolve(statsPath);
          return { filename, stream: fs.createReadStream(filename) };
        })
        .filter(({ filename }) => filename !== mainStatsFilename),
    ];
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  makeReport(outputPath: string, stats: Array<{ filename: string; stream: Readable }>) {
    if (this.options.saveOnlyStats) {
      return { writer: null, stream: null };
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const outputStream = fs.createWriteStream(outputPath);
    const writer = new HTMLWriter({
      scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
      init: `function (data) {
          Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
        }`,
    });

    writer.getStream().pipe(outputStream);

    for (const { filename, stream } of stats) {
      writer.addChunkWriter(stream, path.basename(filename));
    }

    return { writer, stream: outputStream };
  }

  getHTMLReportPath(): string {
    const defaultReportName = `statoscope-[name]-[hash].html`;

    if (this.options.saveReportTo) {
      if (this.options.saveReportTo.endsWith('.html')) {
        return this.options.saveReportTo;
      }

      return path.join(this.options.saveReportTo, defaultReportName);
    }

    return path.join(tmpdir(), defaultReportName);
  }
}

async function waitStreamEnd(stream?: Writable | null): Promise<void> {
  if (!stream) {
    return;
  }

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
