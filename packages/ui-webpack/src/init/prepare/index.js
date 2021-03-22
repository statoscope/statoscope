import path from 'path';

import settings, {
  SETTING_HIDE_CHILD_COMPILATIONS,
  SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT,
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
} from '../../settings';
import modulesToFoamTree from './modules-to-foam-tree';
import module, { moduleNameResource, moduleReasonResource, nodeModule } from './module';
import { colorFromH, colorMap, fileTypeMap, generateColor } from './colors';
import { pluralEng, pluralRus } from './plural';
import { makeEntityResolver } from './entity';
import normalize from './normalize';

export default (discovery) => (rawData, { addQueryHelpers }) => {
  const fileCompilationMap = new Map();
  const files = [];

  if (!Array.isArray(rawData)) {
    rawData = [rawData];
  }

  for (const rawFile of rawData) {
    const fileData = normalize(rawFile);
    const file = {
      name: fileData.name,
      version: fileData.version,
      validation: fileData.validation,
      compilations: [],
    };

    for (const compilation of fileData.compilations) {
      fileCompilationMap.set(compilation.data.hash, {
        file,
        compilation,
      });
      file.compilations.push(compilation.data);
    }

    files.push(file);
  }

  const resolveCompilationFromMap = makeEntityResolver(
    fileCompilationMap,
    (item) => item?.compilation?.data?.hash
  );

  addQueryHelpers({
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    stringify: JSON.stringify,
    toNumber(str) {
      return parseInt(str, 10);
    },
    formatSize(value) {
      const sign = Math.sign(value);
      value = Math.abs(value);

      if (isFinite(value)) {
        if (value < 1000 * 1000) {
          return (sign * (value / 1024)).toFixed(2) + ' kb';
        }

        return (sign * (value / 1024 / 1024)).toFixed(2) + ' mb';
      }
      return 'n/a';
    },
    formatDate(value) {
      return new Date(value).toLocaleString();
    },
    formatDuration(value) {
      const sign = Math.sign(value);
      value = Math.abs(value);

      if (isFinite(value)) {
        if (value < 1000) {
          return (sign * value).toFixed(0) + ' ms';
        }

        return (sign * (value / 1000)).toFixed(0) + ' sec';
      }
      return 'n/a';
    },
    percentFrom(a, b) {
      if (a && !b) {
        return 100;
      }

      if (!a && !b) {
        return 0;
      }

      return (a / b - 1) * 100;
    },
    toFixed(value, digits = 2) {
      return value.toFixed(2);
    },
    color: (value) => (colorMap[value] ? colorMap[value].color : generateColor(value)),
    fileExt: (value = '') => {
      return path.extname(value);
    },
    fileType: (value = '') => {
      const extname = path.extname(value);
      return fileTypeMap[extname] || extname;
    },
    moduleSize(module) {
      // todo gzip
      return module.size;
    },
    chunkName(chunk) {
      return `${chunk.names[0] ? chunk.names.join(', ') : chunk.id}${
        chunk.reason ? ' [' + chunk.reason + ']' : ''
      }`;
    },
    getTotalFilesSize: (value) =>
      (value.files || []).reduce((sum, file) => sum + file.size, 0),
    toMatchRegexp: (value) => new RegExp(`(${value})`),
    resolveChunk(id, compilationHash) {
      return resolveCompilationFromMap(
        compilationHash
      )?.compilation?.resolvers.resolveChunk(id);
    },
    resolveAsset(id, compilationHash) {
      return resolveCompilationFromMap(
        compilationHash
      )?.compilation?.resolvers.resolveAsset(id);
    },
    resolveModule(id, compilationHash) {
      return resolveCompilationFromMap(
        compilationHash
      )?.compilation?.resolvers.resolveModule(id);
    },
    resolvePackage(id, compilationHash) {
      return resolveCompilationFromMap(
        compilationHash
      )?.compilation?.resolvers.resolvePackage(id);
    },
    resolveStat(id) {
      const resolved = resolveCompilationFromMap(id);
      return (
        resolved && { file: resolved?.file, compilation: resolved?.compilation?.data }
      );
    },
    moduleResource: module,
    moduleReasonResource,
    moduleNameResource,
    nodeModule,
    colorFromH,
    plural(value, words) {
      return pluralEng.plural(value, words);
    },
    pluralWithValue(value, words) {
      return pluralEng.pluralWithValue(value, words);
    },
    pluralRus(value, words) {
      return pluralRus.plural(value, words);
    },
    pluralWithValueRus(value, words) {
      return pluralRus.pluralWithValue(value, words);
    },
    modulesToFoamTree: modulesToFoamTree,
    setting(name, defaultValue) {
      return settings.get(name, defaultValue).get();
    },
    shouldHideModule(module) {
      if (!module) {
        return false;
      }

      const shouldHide = settings
        .get(SETTING_HIDE_NODE_MODULES, SETTING_HIDE_NODE_MODULES_DEFAULT)
        .get();
      const resource = module.resolvedResource;

      if (!shouldHide || !resource) {
        return false;
      }

      return !!resource.match(/node_modules/);
    },
    shouldHideCompilation(compilation) {
      if (!compilation) {
        return true;
      }

      const shouldHide = settings
        .get(SETTING_HIDE_CHILD_COMPILATIONS, SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT)
        .get();

      return shouldHide && compilation.isChild;
    },
    settingListItemsLimit() {
      return settings
        .get(SETTING_LIST_ITEMS_LIMIT, SETTING_LIST_ITEMS_LIMIT_DEFAULT)
        .get();
    },
    statName(stat) {
      if (!stat) {
        return 'unknown';
      }

      const hash = stat.compilation.hash.slice(0, 7);

      if (stat.file.name) {
        return `${stat.file.name} (${stat.compilation.name || hash})`;
      } else if (stat.compilation.name) {
        return `${stat.compilation.name} (${hash})`;
      }

      return hash;
    },
  });

  return files;
};
