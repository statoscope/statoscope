import Container from '@statoscope/extensions';
import ExtensionCompressedAPIFactory from '@statoscope/stats-extension-compressed/dist/api';
import ExtensionCompressedPackage from '@statoscope/stats-extension-compressed/package.json';
import ExtensionPackageInfoAPIFactory from '@statoscope/stats-extension-package-info/dist/api';
import ExtensionPackageInfoPackage from '@statoscope/stats-extension-package-info/package.json';
import ExtensionValidationResultPackage from '@statoscope/stats-extension-stats-validation-result/package.json';
import ExtensionValidationResultAPIFactory from '@statoscope/stats-extension-stats-validation-result/dist/api';
import ExtensionCustomReportsPackage from '@statoscope/stats-extension-custom-reports/package.json';
import ExtensionCustomReportsAPIFactory from '@statoscope/stats-extension-custom-reports/dist/api';
import makeIndex from '@statoscope/helpers/dist/indexer';
import {
  HandledStats,
  NormalizedExtension,
  NormalizedFile,
  NormalizeResult,
  RawStatsFileDescriptor,
} from '../types';
import handleCompilations from './handleCompilation';
import validateStats from './validate';
import denormalizeCompilation from './denormalizeCompilation';

// todo: make it injectable
const extensionContainer = new Container();

extensionContainer.register(
  ExtensionCompressedPackage.name,
  ExtensionCompressedPackage.version,
  ExtensionCompressedAPIFactory
);

extensionContainer.register(
  ExtensionPackageInfoPackage.name,
  ExtensionPackageInfoPackage.version,
  ExtensionPackageInfoAPIFactory
);

extensionContainer.register(
  ExtensionValidationResultPackage.name,
  ExtensionValidationResultPackage.version,
  ExtensionValidationResultAPIFactory
);

extensionContainer.register(
  ExtensionCustomReportsPackage.name,
  ExtensionCustomReportsPackage.version,
  ExtensionCustomReportsAPIFactory
);

export default function handleFile(
  rawData: RawStatsFileDescriptor | RawStatsFileDescriptor[]
): NormalizeResult {
  const files = [];
  const compilations = [];
  const fileIndexes = new Map<string, HandledStats['indexes']>();
  const fileResolvers = new Map<string, HandledStats['resolvers']>();

  if (!Array.isArray(rawData)) {
    rawData = [rawData];
  }

  for (const rawFile of rawData) {
    const handledFile = handleRawFile(rawFile);
    files.push(handledFile.file);
    compilations.push(...handledFile.compilations);
    fileIndexes.set(rawFile.name, handledFile.indexes);
    fileResolvers.set(rawFile.name, handledFile.resolvers);
  }

  return { files, compilations, indexes: fileIndexes, resolvers: fileResolvers };
}

export function handleRawFile(
  rawStatsFileDescriptor: RawStatsFileDescriptor
): HandledStats {
  denormalizeCompilation(rawStatsFileDescriptor.data);

  const file: NormalizedFile = {
    name: rawStatsFileDescriptor.name,
    version: rawStatsFileDescriptor.data.version || 'unknown',
    validation: validateStats(rawStatsFileDescriptor.data),
    compilations: [],
    __statoscope: rawStatsFileDescriptor.data.__statoscope,
  };
  const extensions =
    file.__statoscope?.extensions?.map((ext): NormalizedExtension<unknown, unknown> => {
      const item = extensionContainer.resolve(ext.descriptor.name);

      if (!item) {
        return {
          data: ext,
          api: null,
        };
      }

      return {
        data: ext,
        api: item.apiFactory(ext),
      };
    }) ?? [];
  const indexes = {
    extensions: makeIndex((ext) => ext!.data.descriptor.name, extensions),
  };
  const resolvers: HandledStats['resolvers'] = {
    resolveExtension: (id) => indexes.extensions.get(id),
  };
  const compilations = handleCompilations(rawStatsFileDescriptor, file, {
    indexes,
    resolvers,
  });

  return {
    file,
    compilations,
    resolvers,
    indexes,
  };
}
