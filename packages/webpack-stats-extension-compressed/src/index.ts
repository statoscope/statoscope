import { promisify } from 'util';
import path from 'path';
import { Compilation, Module } from 'webpack';
import { ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import CompressedExtensionGenerator, {
  CompressedExtensionFormat,
  CompressorOrPreset,
} from '@statoscope/stats-extension-compressed/dist/generator';
import { author, homepage, name, version } from './version';

export default class WebpackCompressedExtension {
  descriptor: ExtensionDescriptor = { name, version, author, homepage };
  compressedExtensionGenerator = new CompressedExtensionGenerator(this.descriptor);

  constructor(public compressor: CompressorOrPreset) {}

  get(): CompressedExtensionFormat {
    return this.compressedExtensionGenerator.get();
  }

  async handleCompilation(compilation: Compilation, recursive = true): Promise<void> {
    const stack: Compilation[] = [compilation];
    let cursor: Compilation | undefined;

    while ((cursor = stack.pop())) {
      if (recursive) {
        stack.push(...cursor.children);
      }

      const readFile = promisify(
        cursor.compiler.outputFileSystem.readFile.bind(cursor.compiler.outputFileSystem)
      );

      for (const name of Object.keys(cursor.assets)) {
        const assetPath = path.join(cursor.compiler.outputPath, name);
        const content = await readFile(assetPath);

        if (!content) {
          throw new Error(`Can't read ${name} asset`);
        }

        this.compressedExtensionGenerator.handleResource(
          cursor.hash as string,
          name,
          content,
          this.compressor
        );
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

        let concatenated = new Buffer('');

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
            concatenated = Buffer.concat([
              concatenated,
              content instanceof Buffer ? content : Buffer.from(content),
            ]);
          }
        }

        this.compressedExtensionGenerator.handleResource(
          cursor.hash as string,
          moduleName,
          concatenated,
          this.compressor
        );
      }
    }
  }
}