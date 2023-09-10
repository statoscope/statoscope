import path from 'path';
import { Compiler } from 'webpack';
import { ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import Generator, {
  Format,
  Payload,
} from '@statoscope/stats-extension-package-info/dist/generator';
import { StatsExtensionWebpackAdapter } from '@statoscope/webpack-model';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { author, homepage, name, version, description } = require('../package.json');

const pluginName = `${name}@${version}`;

declare interface BaseResolveRequest {
  descriptionFilePath?: string;
  descriptionFileRoot?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  descriptionFileData?: object;
}

export default class WebpackCompressedExtension
  implements StatsExtensionWebpackAdapter<Payload>
{
  descriptor: ExtensionDescriptor = { name, version, author, homepage, description };
  generator = new Generator(this.descriptor);

  getExtension(): Format {
    return this.generator.get();
  }

  handleCompiler(compiler: Compiler, context?: string): void {
    // @ts-ignore
    context ??= compiler.options.stats?.context ?? compiler.context;
    compiler.hooks.compilation.tap(pluginName, (compilation): void => {
      compilation.resolverFactory.hooks.resolver.intercept({
        // @ts-ignore
        factory(key: string, hook) {
          hook!.tap('MyPlugin', (resolver) => {
            resolver.hooks.result.tap('MyPlugin', handleResolverResult);
          });
          return hook;
        },
      });
    });
    const handleResolverResult = (result: BaseResolveRequest): BaseResolveRequest => {
      const pkg = result.descriptionFileData as {
        name: string;
        version: string;
      } | null;

      if (pkg && result.descriptionFileRoot) {
        const instancePath = path.relative(context!, result.descriptionFileRoot);
        const item = {
          packageName: pkg.name,
          instancePath,
          info: { version: pkg.version },
        };
        this.generator.handleInstance(
          null,
          item.packageName,
          item.instancePath,
          item.info,
        );
        // webpack 4 uses absolute path for some modules
        // @ts-ignore
        const compilation = compiler._lastCompilation || {};
        if (!compilation.chunkGraph && instancePath.match(/^\.\./)) {
          const item = {
            packageName: pkg.name,
            instancePath: result.descriptionFileRoot,
            info: { version: pkg.version },
          };
          this.generator.handleInstance(
            null,
            item.packageName,
            item.instancePath,
            item.info,
          );
        }
      }
      return result;
    };

    compiler.resolverFactory.hooks.resolver.intercept({
      // @ts-ignore
      factory(key: string, hook) {
        hook!.tap('MyPlugin', (resolver) => {
          resolver.hooks.result.tap('MyPlugin', handleResolverResult);
        });
        return hook;
      },
    });
  }
}
