/* global Statoscope */

import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import { promisify } from 'util';
import open from 'open';
// @ts-ignore
import { stringifyStream } from '@discoveryjs/json-ext';
import HTMLWriter from '@statoscope/report-writer';
import { Compilation, Compiler, Module } from 'webpack';
import gzipSize from 'gzip-size';
import { Stats } from '@statoscope/stats';
import { Compilation as StatoscopeCompilation } from '@statoscope/stats/spec/compilation';
import { Asset as StatoscopeAsset } from '@statoscope/stats/spec/asset';
import { Module as StatoscopeModule } from '@statoscope/stats/spec/module';
import { Size } from '@statoscope/stats/spec/source';
import * as version from './version';

export type CompressFunction = (source: Buffer | string, filename: string) => Size;

export type Options = {
  name?: string;
  saveTo?: string;
  saveStatsTo?: string;
  additionalStats?: string[];
  statsOptions?: Record<string, unknown>;
  watchMode?: boolean;
  open?: false | 'dir' | 'file';
  clientCompression?: false | 'gzip' | CompressFunction;
};

const compressByType: Record<string, CompressFunction> = {
  gzip(source: Buffer | string): Size {
    return { compressor: 'gzip', size: gzipSize.sync(source) };
  },
};

export default class StatoscopeWebpackPlugin {
  options: Options;
  saveToDir?: string;
  saveToFile?: string;

  constructor(options: Partial<Options> = {}) {
    this.options = {
      open: 'file',
      clientCompression: 'gzip',
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
      statsObj.__statoscope = await this.getStatoscopeMeta(stats.compilation);
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

  private async getStatoscopeMeta(compilation: Compilation): Promise<Stats | null> {
    const compressor = this.resolveCompressor();

    if (!compressor) {
      return null;
    }

    const statoscopeMeta: Stats = {
      format: { name: version.name, version: version.version },
      compilations: [],
    };
    const stack: Compilation[] = [compilation];
    let cursor: Compilation | undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    while ((cursor = stack.pop())) {
      stack.push(...cursor.children);

      const readFile = promisify(
        cursor.compiler.outputFileSystem.readFile.bind(cursor.compiler.outputFileSystem)
      );

      const compilationData: StatoscopeCompilation = {
        id: cursor.hash as string,
        modules: [],
        assets: [],
      };

      statoscopeMeta.compilations.push(compilationData);

      for (const name of Object.keys(cursor.assets)) {
        const assetData: StatoscopeAsset = {
          id: name,
          source: { sizes: [] },
        };
        const assetPath = path.join(cursor.compiler.outputPath, name);
        const content = await readFile(assetPath);

        compilationData.assets.push(assetData);

        if (!content) {
          throw new Error(`Can't read ${name} asset`);
        }

        assetData.source?.sizes.push(compressor(content, name));
      }

      const modulesStack: Module[] = [...cursor.modules];
      let modulesCursor: Module | undefined;
      while ((modulesCursor = modulesStack.pop())) {
        // @ts-ignore
        if (modulesCursor.modules) {
          // @ts-ignore
          modulesStack.push(...modulesCursor.modules);
        }
        const moduleName = modulesCursor.readableIdentifier(
          cursor.compiler.requestShortener
        );
        // @ts-ignore
        const moduleData: StatoscopeModule = {
          resource: moduleName,
          source: { sizes: [] },
        };
        compilationData.modules.push(moduleData);

        let compressedSize = 0;
        let compressorType = '';

        for (const type of modulesCursor.getSourceTypes()) {
          const runtimeChunk = cursor.chunkGraph
            .getModuleChunks(modulesCursor)
            .find((chunk) => chunk.runtime);

          if (runtimeChunk) {
            const source = cursor.codeGenerationResults.getSource(
              modulesCursor,
              runtimeChunk.runtime,
              type
            );
            const content = source.source();
            const compressed = compressor(content, moduleName);

            compressedSize += compressed.size;
            compressorType = compressed.compressor as string;
          }
        }

        moduleData.source?.sizes.push({
          compressor: compressorType,
          size: compressedSize,
        });
      }
    }

    return statoscopeMeta;
  }

  private resolveCompressor(): CompressFunction | null {
    const { clientCompression } = this.options;

    if (!clientCompression) {
      return null;
    }

    if (typeof clientCompression === 'function') {
      return clientCompression;
    }

    if (Object.prototype.hasOwnProperty.call(compressByType, clientCompression)) {
      return compressByType[clientCompression];
    }

    throw new Error('Unknown compression type');
  }
}
