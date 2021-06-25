import {
  default as makeEntityResolver,
  Resolver,
} from '@statoscope/helpers/dist/entity-resolver';
import { APIFactory } from '@statoscope/extensions';
import { Format, Package, Instance } from './generator';

export type API = {
  getPackage: (compilationId: string, packageName: string) => Package | null;
  getInstance: (
    compilationId: string,
    packageName: string,
    instancePath: string
  ) => Instance | null;
};

const makeAPI: APIFactory<Format, API> = (source) => {
  const packageResolvers: Map<string, Resolver<string, Package>> = new Map();
  const instanceResolvers: Map<Package, Resolver<string, Instance>> = new Map();

  for (const compilation of source.payload.compilations) {
    packageResolvers.set(
      compilation.id,
      makeEntityResolver(compilation.packages, (r) => r.name)
    );

    for (const packageItem of compilation.packages) {
      instanceResolvers.set(
        packageItem,
        makeEntityResolver(packageItem.instances, (r) => r.path)
      );
    }
  }

  return {
    getPackage(compilationId: string, packageId: string): Package | null {
      return packageResolvers.get(compilationId)?.(packageId) ?? null;
    },
    getInstance(
      compilationId: string,
      packageId: string,
      instancePath: string
    ): Instance | null {
      const resolvedPackage = packageResolvers.get(compilationId)?.(packageId) ?? null;

      if (!resolvedPackage) {
        return null;
      }

      return instanceResolvers.get(resolvedPackage)?.(instancePath) ?? null;
    },
  };
};

export default makeAPI;
