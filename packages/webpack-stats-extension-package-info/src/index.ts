import path from 'path';
import { Compiler } from 'webpack';
import { ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import Generator, {
  Format,
  InstanceInfo,
} from '@statoscope/stats-extension-package-info/dist/generator';
import { author, homepage, name, version } from './version';

const pluginName = `${name}@${version}`;

export default class WebpackCompressedExtension {
  descriptor: ExtensionDescriptor = { name, version, author, homepage };
  generator = new Generator(this.descriptor);

  get(): Format {
    return this.generator.get();
  }

  handleCompiler(compiler: Compiler): void {
    compiler.hooks.compilation.tap(pluginName, (compilation): void => {
      const items: Array<{
        packageName: string;
        instancePath: string;
        info: InstanceInfo;
      }> = [];
      compilation.hooks.afterHash.tap(pluginName, () => {
        for (const item of items) {
          this.generator.handleInstance(
            compilation.hash as string,
            item.packageName,
            item.instancePath,
            item.info
          );
        }
      });
      compilation.resolverFactory.hooks.resolver
        .for('normal')
        .tap(pluginName, (resolver) => {
          resolver.hooks.result.tap('MyPlugin', (result) => {
            const pkg = result.descriptionFileData as {
              name: string;
              version: string;
            } | null;

            if (pkg && result.descriptionFileRoot) {
              const instancePath = path.relative(
                compiler.context,
                result.descriptionFileRoot
              );

              items.push({
                packageName: pkg.name,
                instancePath,
                info: { version: pkg.version },
              });

              // webpack 4 uses absolute path for some modules
              if (!compilation.chunkGraph && instancePath.match(/^\.\./)) {
                items.push({
                  packageName: pkg.name,
                  instancePath: result.descriptionFileRoot,
                  info: { version: pkg.version },
                });
              }
            }

            return result;
          });
        });
    });
  }
}
