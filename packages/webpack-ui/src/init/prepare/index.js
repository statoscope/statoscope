import { joraHelpers as webpackJoraHelpers, normalize } from '@statoscope/webpack-model';
import { jora as joraHelpers } from '@statoscope/helpers';
import modulesToFoamTree from '@statoscope/webpack-model/dist/modules-to-foam-tree';
import settings, {
  SETTING_HIDE_CHILD_COMPILATIONS,
  SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT,
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
} from '../../settings';

export default () => (rawData, { addQueryHelpers }) => {
  const { files, compilations } = normalize(rawData);

  addQueryHelpers({
    ...webpackJoraHelpers(compilations),
    ...joraHelpers(),
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
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
  });

  return files;
};
