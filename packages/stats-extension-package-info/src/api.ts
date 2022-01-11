import { APIFactory } from '@statoscope/extensions';
import makeIndex, { IndexAPI } from '@statoscope/helpers/dist/indexer';
import { Format, Package, Instance } from './generator';

export type API = {
  getPackage: (compilationId: string | null, packageName: string) => Package | null;
  getInstance: (
    compilationId: string | null,
    packageName: string,
    instancePath: string
  ) => Instance | null;
};

const makeAPI: APIFactory<Format, API> = (source) => {
  const packageIndexes: Map<string | null, IndexAPI<string, Package>> = new Map();
  const instanceIndexes: Map<Package, IndexAPI<string, Instance>> = new Map();

  for (const compilation of source.payload.compilations) {
    packageIndexes.set(
      compilation.id,
      makeIndex((r) => r.name, compilation.packages)
    );

    for (const packageItem of compilation.packages) {
      instanceIndexes.set(
        packageItem,
        makeIndex((r) => r.path, packageItem.instances)
      );
    }
  }

  return {
    getPackage(compilationId: string | null, packageId: string): Package | null {
      return (
        packageIndexes.get(compilationId)?.get(packageId) ??
        packageIndexes.get(null)?.get(packageId) ??
        null
      );
    },
    getInstance(
      compilationId: string | null,
      packageId: string,
      instancePath: string
    ): Instance | null {
      const resolvedPackage =
        packageIndexes.get(compilationId)?.get(packageId) ??
        packageIndexes.get(null)?.get(packageId) ??
        null;

      if (!resolvedPackage) {
        return null;
      }

      return instanceIndexes.get(resolvedPackage)?.get(instancePath) ?? null;
    },
  };
};

export default makeAPI;
