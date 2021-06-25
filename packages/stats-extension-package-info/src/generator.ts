import { Extension, ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import makeResolver, { Resolver } from '@statoscope/helpers/dist/entity-resolver';
import { name, version, author, homepage } from './version';

export type Format = Extension<Payload>;
export type InstanceInfo = { version: string };
export type Instance = { path: string; info: InstanceInfo };
export type Package = {
  name: string;
  instances: Array<Instance>;
};
export type Compilation = {
  id: string;
  packages: Array<Package>;
};
export type Payload = {
  compilations: Array<Compilation>;
};

export default class Generator {
  private packageResolvers: Map<Compilation, Resolver<string, Package>> = new Map();
  private instanceResolvers: Map<Package, Resolver<string, Instance>> = new Map();
  private descriptor: ExtensionDescriptor = {
    name,
    version,
    author,
    homepage,
    adapter: this.adapter,
  };
  private payload: Payload = { compilations: [] };
  private resolveCompilation = makeResolver(this.payload.compilations, (item) => item.id);

  constructor(private adapter?: ExtensionDescriptor) {}

  handleInstance(
    compilationId: string,
    packageName: string,
    instance: string,
    info: InstanceInfo
  ): void {
    let compilation = this.resolveCompilation(compilationId);
    let packageResolver: Resolver<string, Package> | undefined;

    if (compilation) {
      packageResolver = this.packageResolvers.get(compilation);
    } else {
      compilation = {
        id: compilationId,
        packages: [],
      };
      packageResolver = makeResolver(compilation.packages, (item) => item.name);
      this.packageResolvers.set(compilation, packageResolver);
      this.payload.compilations.push(compilation);
    }

    let resolvedPackage = packageResolver!(packageName);

    if (!resolvedPackage) {
      const instances: Instance[] = [];

      resolvedPackage = { name: packageName, instances };
      compilation.packages.push(resolvedPackage);
      this.instanceResolvers.set(
        resolvedPackage,
        makeResolver(instances, (item) => item.path)
      );
    }

    const instanceResolver = this.instanceResolvers.get(resolvedPackage);
    let resolvedInstance = instanceResolver!(instance);

    if (!resolvedInstance) {
      resolvedInstance = { path: instance, info: { version: info.version } };
      resolvedPackage.instances.push(resolvedInstance);
    } else {
      if (resolvedInstance.info.version !== info.version) {
        throw new Error(
          `[Instnce version conflict] ${instance} old ${resolvedInstance.info.version} new ${info.version}`
        );
      }
    }
  }

  get(): Format {
    return { descriptor: this.descriptor, payload: this.payload };
  }
}
