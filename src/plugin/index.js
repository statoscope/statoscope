'use strict';

const crypto = require('crypto');
const fork = require('child_process').fork;
const rempl = require('rempl/src/index');
const path = require('path');
const fs = require('fs');
const opn = require('opn');
const openInEditor = require('open-in-editor');
const NodeOutputFileSystem = require.main.require('webpack/lib/node/NodeOutputFileSystem');
const RequestShortener = require.main.require('webpack/lib/RequestShortener');

const pluginName = 'webpack-runtime-analyzer';

function isObject(obj) {
  return typeof obj == 'object' && obj;
}

function getFileHash(fs, filepath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filepath);

    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function cloneArray(array) {
  return array.map(function (el) {
    if (Array.isArray(el)) {
      return cloneArray(el);
    }

    if (isObject(el) && el.constructor == Object) {
      return deepExtend({}, el);
    }

    return el;
  });
}

function deepExtend(target) {
  var sources = Array.prototype.slice.call(arguments, 1);

  if (typeof target != 'object' || !target) {
    return;
  }

  for (var i = 0; i < sources.length; i++) {
    var source = sources[i];

    if (isObject(source)) {
      for (var sourceKey in source) {
        if (source.hasOwnProperty(sourceKey)) {
          var value = source[sourceKey];

          if (Array.isArray(value)) {
            target[sourceKey] = cloneArray(value);
          } else if (isObject(value) && value.constructor == Object) {
            target[sourceKey] = deepExtend({}, value);
          } else {
            target[sourceKey] = value;
          }
        }
      }
    }
  }

  return target;
}

function unixpath(value) {
  if (typeof value === 'string' && process.platform === 'win32') {
    return value
      .replace(/(^|!)[a-z]+:/gi, '$1')
      .replace(/\\/g, '/');
  }

  return value;
}

class RuntimeAnalyzerPlugin {
  constructor(options) {
    // mix with default options
    this.options = deepExtend({
      mode: 'standalone',
      port: 7777,
      watchModeOnly: true,
      ui: path.resolve(__dirname, '../../dist/main.js')
    }, options);
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    const run = this.run.bind(this);

    compiler.hooks.watchRun.tapAsync(pluginName, run);

    if (!this.options.watchModeOnly) {
      compiler.hooks.run.tapAsync(pluginName, run);
    }
  }

  startRemplServer() {
    console.info('Starting rempl server...');

    fork(path.resolve(__dirname, 'server.js'), { silent: true })
      .once('exit', code => {
        console.error('\n[ERROR] RuntimeAnalyzerPlugin exited with code', code);
        process.exit(code);
      })
      .on('message', data => {
        if (data && data.event === 'server-started') {
          this.publisher.wsendpoint = data.endpoint;
          this.publisher.connectWs(data.endpoint);

          if (this.options.open) {
            opn(data.endpoint);
          }
        }
      })
      .send({
        name: pluginName,
        port: this.options.port
      });
  }

  run(compiler, done) {
    const publisher = this.publisher = this.createPublisher();
    const requestShortener = new RequestShortener(compiler.context);

    this.compiler = compiler;
    this.requestShortener = requestShortener;

    // run server after publisher is created
    // since server uses publisher when started
    if (this.options.mode === 'standalone') {
      this.startRemplServer();
    }

    const webpackVersion = require.main.require('webpack/package.json').version;
    const publicPath = compiler.options.output.publicPath || '/';
    const outputPath = compiler.options.output.path;
    const compilerContext = compiler.context;
    var statusChannel = publisher.ns('status');
    var dataChannel = publisher.ns('data');

    const stats = {};

    compiler.hooks.thisCompilation.tap('Avito Builder', compilation => {
      if (compilation.compiler.isChild()) {
        return;
      }
      this.compilation = compilation;

      compilation.hooks.optimizeChunkAssets.tap('Avito Builder - generating bundle info', () => {
        let assetsData = {
          initial: {},
          dynamic: {}
        };

        stats.assets = compilation.chunkGroups.reduce((all, group) => {
          if (!group.isInitial()) {
            return all;
          }

          const initialFiles = new Set();
          const dynamicFiles = new Set();
          const chunks = group.chunks.map(chunk => ({ type: 'initial', chunk }));
          const stack = [...group.getChildren()];
          let cursor;

          while (cursor = stack.pop()) { // eslint-disable-line no-cond-assign
            stack.push(...cursor.getChildren());
            chunks.push(...cursor.chunks.map(chunk => ({ type: 'dynamic', chunk })));
          }

          chunks.forEach(({ chunk, type }) => {
            chunk.files.forEach(file => {
              const target = type === 'initial' ? initialFiles : dynamicFiles;

              target.add(path.join(publicPath, file));
            });
          });

          if (initialFiles.size) {
            all.initial[group.runtimeChunk.name] = [...initialFiles];
          }

          if (dynamicFiles.size) {
            all.dynamic[group.runtimeChunk.name] = [...dynamicFiles];
          }

          return all;
        }, assetsData);
      });

      compiler.hooks.afterEmit.tapAsync('Avito Builder - generating debug info', async (compilation, done) => {
        let outputFileSystem = compilation.compiler.outputFileSystem;

        if (compilation.compiler.outputFileSystem instanceof NodeOutputFileSystem) {
          outputFileSystem = fs;
        }

        const detailData = {
          input: { entries: [], modules: [], files: [] },
          output: { bundles: [], chunks: [], files: [] }
        };

        compilation.entrypoints.forEach((entry, name) => {
          detailData.input.entries.push({ name })
        });

        const modules = [...compilation.modules];
        let module;

        while (module = modules.pop()) { // eslint-disable-line no-cond-assign
          const moduleId = this.getModuleId(module);

          let resource = module.resource ? path.relative(compiler.context, module.resource) : undefined;
          let extractedFrom;

          if (!resource && module.issuer && module.issuer.resource) {
            resource = path.relative(compiler.context, module.issuer.resource);
          }

          resource = resource && resource.split('?')[0];

          if (resource && !detailData.input.files.find(({ path }) => path === resource)) {
            const stats = compiler.inputFileSystem.statSync(resource);

            detailData.input.files.push({
              path: resource,
              ext: path.extname(resource),
              size: stats.size
            });
          }

          if (module.constructor.name === 'ConcatenatedModule') {
            if (module.rootModule && !compilation.modules.includes(module.rootModule)) {
              modules.push(module.rootModule);
            }

            if (module.modules && !compilation.modules.includes(module.rootModule)) {
              module.modules.forEach(m => !modules.includes(m) && modules.push(m));
            }
          } else if (
            module.constructor.name === 'MultiModule' ||
            module.constructor.name === 'ContextModule'
          ) {
            module.dependencies.forEach(dep => {
              if (dep.module && !compilation.modules.includes(dep.module)) {
                modules.push(dep.module);
              }
            });
          } else if (module.constructor.name === 'CssModule') {
            if (module.issuer) {
              extractedFrom = this.getModuleId(module.issuer);

              if (!compilation.modules.includes(module.issuer)) {
                modules.push(module.issuer);
              }
            }
          }

          const moduleInfo = {
            id: moduleId,
            file: resource,
            size: module.size(),
            type: module.constructor.name,
            isEntry: module.isEntryModule(),
            extracted: extractedFrom,
            concatenated: module.modules && module.modules.map(module => this.getModuleId(module)),
            deopt: module.optimizationBailout.map(reason => {
              if (typeof reason === 'function') {
                return reason(requestShortener);
              }

              return reason;
            }),
            deps: module.dependencies
              .filter(dependency => dependency.module)
              .map(dependency => ({ module: this.getModuleId(dependency.module) })),
            reasons: module.reasons
              .filter(reason => reason.module)
              .map(reason => ({ module: this.getModuleId(reason.module) }))
          };

          detailData.input.modules.push(moduleInfo);
        }

        detailData.output.chunks = compilation.chunks.map(chunk => ({
          id: chunk.id,
          name: chunk.name,
          reason: chunk.chunkReason,
          size: chunk.size({}),
          groups: [...chunk.groupsIterable].map(group => group.id),
          canBeInitial: chunk.canBeInitial(),
          onlyInitial: chunk.isOnlyInitial(),
          entryModule: chunk.entryModule && this.getModuleId(chunk.entryModule),
          files: chunk.files.map(file => {
            const absFilePath = path.join(outputPath, file);

            if (!detailData.output.files.find(({ path }) => path === file)) {
              const stats = outputFileSystem.statSync(absFilePath);
              let { size } = stats;

              if (!size) {
                size = compilation.assets[file].size();
              }

              detailData.output.files.push({
                path: file,
                ext: path.extname(file),
                size
              });
            }

            return file;
          }),
          modules: chunk.getModules().map(module => this.getModuleId(module))
        }));

        detailData.output.chunkGroups = compilation.chunkGroups.map(group => {
          return {
            id: group.id,
            isInitial: group.isInitial(),
            name: group.name,
            chunks: group.chunks.map(chunk => chunk.id),
            runtimeChunk: group.runtimeChunk && group.runtimeChunk.id,
            children: [...group.childrenIterable].map(group => group.id),
            parents: [...group.parentsIterable].map(group => group.id)
          };
        });

        for (const group of compilation.chunkGroups) {
          if (group.runtimeChunk) {
            detailData.output.bundles.push({
              name: group.runtimeChunk.name,
              module: this.getModuleId(group.runtimeChunk.entryModule),
              chunks: group.chunks.map(chunk => chunk.id)
            });
          }
        }

        await Promise.all(detailData.input.files
          .map(file => {
            return getFileHash(fs, path.join(compilerContext, file.path))
              .then(hash => file.hash = hash);
          })
        );
        await Promise.all(detailData.output.files
          .map(file => {
            return getFileHash(outputFileSystem, path.join(outputPath, file.path))
              .then(hash => file.hash = hash);
          }));

        stats.detail = {
          input: detailData.input,
          output: detailData.output
        };

        var data = {
          version: webpackVersion,
          hash: compilation.hash,
          mode: compilation.options.mode || 'production',
          context: unixpath(compilation.compiler.context),
          assets: stats.assets,
          input: detailData.input,
          output: detailData.output,
          errors: this.collectWarnings(compilation.errors),
          warnings: this.collectWarnings(compilation.warnings)
        };

        dataChannel.publish(data);

        done();

        if (publisher.wsendpoint) {
          // use timer to output link after all the stats is shown
          setTimeout(function () {
            console.log('\nWebpack Runtime Analyzer is available on', publisher.wsendpoint);
          }, 0);
        }
      });
    });

    compiler.hooks.compile.tap(pluginName, () => {
      statusChannel.publish('compiling');
    });

    compiler.hooks.invalid.call(pluginName, () => {
      statusChannel.publish('invalidated');
    });

    compiler.hooks.done.tap(pluginName, () => {
      statusChannel.publish(this.compilation.errors.length ? 'failed' : 'success');
    });

    compiler.hooks.failed.tap(pluginName, () => {
      statusChannel.publish('failed');
    });

    done();
  }

  createPublisher() {
    const editor = openInEditor.configure({});
    const getWebUI = rempl.scriptFromFile(this.options.ui);
    const publisher = rempl.createPublisher(pluginName, function (settings, callback) {
      if (settings.dev) {
        return callback(null, 'url', 'http://localhost:8888');
      }

      getWebUI(settings, callback);
    }, {
      ws: this.options.mode !== 'standalone'
    });

    publisher.provide('openInEditor', function (path, cb) {
      if (editor) {
        editor.open(path)
          .then(function () {
            cb({ ok: true });
          }, function (err) {
            cb({ ok: false, error: err })
          });
      } else {
        cb({ ok: false, error: 'Editor is not specified' })
      }
    });

    return publisher;
  }

  getModuleId(module) {
    if (module.libIdent) {
      return module.libIdent(this.compiler);
    }

    return module.readableIdentifier(this.requestShortener);
  }

  collectWarnings(source) {
    return source.reduce((all, warning) => {
      const entrypoints = warning.entrypoints || (warning.entrypoint ? [warning.entrypoint] : []);
      const modules = warning.modules || (warning.module ? [warning.module] : []);
      const chunks = warning.chunks || (warning.chunk ? [warning.chunk] : []);
      const assets = warning.assets || (warning.asset ? [warning.asset] : []);

      if (entrypoints) {
        entrypoints.forEach(data => {
          all.push({
            from: 'entrypoint',
            type: warning.constructor.name,
            message: warning.message,
            source: data.name
          });
        })
      }

      if (modules) {
        modules.forEach(data => {
          all.push({
            from: 'module',
            type: warning.constructor.name,
            message: warning.message,
            source: this.getModuleId(data)
          });
        })
      }

      if (chunks) {
        chunks.forEach(data => {
          all.push({
            from: 'chunk',
            type: warning.constructor.name,
            message: warning.message,
            source: data.id
          });
        })
      }

      if (assets) {
        assets.forEach(data => {
          all.push({
            from: 'asset',
            type: warning.constructor.name,
            message: warning.message,
            source: data.name
          });
        })
      }

      if (!entrypoints.length && !modules.length && !chunks.length && !assets.length) {
        all.push({
          from: 'unknown',
          type: warning.constructor.name,
          message: warning.message,
        });
      }

      return all;
    }, []);
  }
}

module.exports = RuntimeAnalyzerPlugin;
