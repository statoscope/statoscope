import path from 'path';
import { promisify } from 'util';
import { Compilation, Compiler, Module } from 'webpack';
import { ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import CompressedExtensionGenerator, {
  CompressorOrPreset,
  Format,
  Payload,
} from '@statoscope/stats-extension-compressed/dist/generator';
import { StatsExtensionWebpackAdapter } from '@statoscope/webpack-model';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { author, homepage, name, version, description } = require('../package.json');

const pluginName = `${name}@${version}`;

type CodeGenerationResult = ReturnType<Module['codeGeneration']>;

export default class WebpackCompressedExtension
  implements StatsExtensionWebpackAdapter<Payload>
{
  descriptor: ExtensionDescriptor = { name, version, author, homepage, description };
  compressedExtensionGenerator = new CompressedExtensionGenerator(this.descriptor);

  constructor(public compressor: CompressorOrPreset) {}

  getExtension(): Format {
    return this.compressedExtensionGenerator.get();
  }

  handleCompiler(compiler: Compiler): void {
    const isRspack = 'rspackVersion' in compiler.webpack;
    const rspackCodeGenerationResults: Map<string, CodeGenerationResult> = new Map();

    if (isRspack) {
      compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
        rspackCodeGenerationResults.clear();

        compilation.hooks.executeModule.tap(
          pluginName,
          ({ moduleObject, codeGenerationResult }) => {
            if (!moduleObject) {
              return;
            }

            rspackCodeGenerationResults.set(moduleObject.id, codeGenerationResult);
          },
        );
      });
    }

    compiler.hooks.done.tapAsync(pluginName, async (stats, cb) => {
      const stack: Compilation[] = [stats.compilation];
      let cursor: Compilation | undefined;

      while ((cursor = stack.pop())) {
        stack.push(...cursor.children);

        // webpack 4
        let readFile = promisify(
          cursor.compiler.inputFileSystem.readFile.bind(cursor.compiler.inputFileSystem),
        );

        // webpack 5
        if (
          cursor.compiler.outputFileSystem &&
          typeof cursor.compiler.outputFileSystem.readFile === 'function'
        ) {
          readFile = promisify(
            cursor.compiler.outputFileSystem.readFile.bind(
              cursor.compiler.outputFileSystem,
            ),
          );
        }

        for (const name of Object.keys(cursor.assets)) {
          const assetPath = path.join(cursor.compiler.outputPath, name);
          let content: string | Buffer | undefined;
          try {
            content = await readFile(assetPath);

            if (!content) {
              throw new Error();
            }

            this.compressedExtensionGenerator.handleResource(
              cursor.hash as string,
              name,
              content,
              this.compressor,
            );
          } catch (e) {
            console.warn(`Can't read the asset ${name}`);
          }
        }

        const modulesStack: Module[] = [...cursor.modules];
        let modulesCursor: Module | undefined;
        while ((modulesCursor = modulesStack.pop())) {
          // @ts-ignore
          if (modulesCursor.modules) {
            // @ts-ignore
            modulesStack.push(...modulesCursor.modules);
          }

          let concatenated = Buffer.from('');

          if (
            modulesCursor.constructor.name === 'CssModule' &&
            // @ts-ignore
            (typeof modulesCursor.content === 'string' ||
              // @ts-ignore
              modulesCursor.content instanceof Buffer)
          ) {
            this.compressedExtensionGenerator.handleResource(
              cursor.hash as string,
              modulesCursor.identifier(),
              // @ts-ignore
              modulesCursor.content,
              this.compressor,
            );
          } else if (cursor.chunkGraph) {
            // webpack 5 and rspack

            if (isRspack) {
              // Identifier contains source type and path, but keys in rspackCodeGenerationResults don't contain the source type.
              const id = modulesCursor.identifier().split('|')[1];
              const codeGenerationResult = rspackCodeGenerationResults.get(id);
              if (!codeGenerationResult || !('get' in codeGenerationResult)) {
                continue;
              }
              // @ts-ignore
              const content = codeGenerationResult.get('javascript') as
                | undefined
                | string
                | Buffer;
              if (content) {
                concatenated = Buffer.concat([
                  concatenated,
                  content instanceof Buffer ? content : Buffer.from(content),
                ]);
              }
            } else {
              for (const type of modulesCursor.getSourceTypes()) {
                const runtimeChunk = cursor.chunkGraph
                  .getModuleChunks(modulesCursor)
                  .find((chunk) => chunk.runtime);

                if (runtimeChunk) {
                  const source = cursor.codeGenerationResults.getSource(
                    modulesCursor,
                    runtimeChunk.runtime,
                    type,
                  );
                  if (!source) {
                    continue;
                  }
                  const content = source.source();
                  concatenated = Buffer.concat([
                    concatenated,
                    content instanceof Buffer ? content : Buffer.from(content),
                  ]);
                }
              }
            }
          } else {
            // webpack 4
            try {
              // @ts-ignore
              const source = cursor.moduleTemplates.javascript.render(
                modulesCursor,
                cursor.dependencyTemplates,
                { chunk: modulesCursor.getChunks()[0] },
              );
              const content = source.source();
              concatenated = Buffer.concat([
                concatenated,
                content instanceof Buffer ? content : Buffer.from(content),
              ]);
            } catch (e) {
              // in webpack 4 we can't generate source for all the modules :(
            }
          }

          if (!concatenated.length) {
            continue;
          }

          this.compressedExtensionGenerator.handleResource(
            cursor.hash as string,
            modulesCursor.identifier(),
            concatenated,
            this.compressor,
          );
        }
      }

      cb();
    });
  }
}
