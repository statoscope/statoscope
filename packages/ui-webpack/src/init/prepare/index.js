import path from 'path';

import settings, {
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
  const compilationsMap = new Map();
  const compilations = [];

  if (!Array.isArray(rawData)) {
    rawData = [rawData];
  }

  for (const data of rawData) {
    const compilationData = normalize(data);

    for (const compilation of compilationData.compilations) {
      compilationsMap.set(compilation.data.hash, compilation);
      compilations.push(compilation.data);
    }
  }

  const resolveCompilationFromMap = makeEntityResolver(
    compilationsMap,
    (item) => item?.data?.hash
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
      return resolveCompilationFromMap(compilationHash)?.resolvers.resolveChunk(id);
    },
    resolveAsset(id, compilationHash) {
      return resolveCompilationFromMap(compilationHash)?.resolvers.resolveAsset(id);
    },
    resolveModule(id, compilationHash) {
      return resolveCompilationFromMap(compilationHash)?.resolvers.resolveModule(id);
    },
    resolvePackage(id, compilationHash) {
      return resolveCompilationFromMap(compilationHash)?.resolvers.resolvePackage(id);
    },
    resolveCompilation(id) {
      return resolveCompilationFromMap(id)?.data;
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
    settingListItemsLimit() {
      return settings
        .get(SETTING_LIST_ITEMS_LIMIT, SETTING_LIST_ITEMS_LIMIT_DEFAULT)
        .get();
    },
    compilationName(compilation) {
      if (!compilation) {
        return 'unknown';
      }

      const hash = compilation.hash.slice(0, 7);

      if (compilation.fileName) {
        return `${compilation.fileName} (${compilation.name || hash})`;
      } else if (compilation.name) {
        return `${compilation.name} (${hash})`;
      }

      return hash;
    },
  });

  return { compilations };
};
