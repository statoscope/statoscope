import { joraHelpers as webpackJoraHelpers, normalize } from '@statoscope/webpack-model';
import { jora as joraHelpers } from '@statoscope/helpers';
import { Node } from '@statoscope/webpack-model/dist/modules-to-foam-tree';
import {
  NormalizedAsset,
  NormalizedChunk,
  NormalizedCompilation,
  NormalizedModule,
} from '@statoscope/webpack-model/dist/normalize';
import { Size } from '@statoscope/stats/spec/source';
import settings, {
  SETTING_HIDE_CHILD_COMPILATIONS,
  SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT,
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
  SETTING_SHOW_COMPRESSED,
  SETTING_SHOW_COMPRESSED_DEFAULT,
} from '../../settings';
import { PrepareFn, RawData, StatoscopeWidget, TargetData } from '../../../types';

export default (() =>
  (rawData: RawData, { addQueryHelpers }: StatoscopeWidget): unknown => {
    const { files, compilations } = normalize(rawData);
    const wpJoraHelpers = webpackJoraHelpers(compilations, files);

    addQueryHelpers({
      ...wpJoraHelpers,
      ...joraHelpers(),
      encodeURIComponent: encodeURIComponent,
      decodeURIComponent: decodeURIComponent,
      modulesToFoamTree(modules: NormalizedModule[], hash?: string): Node {
        return wpJoraHelpers.modulesToFoamTree(
          modules,
          hash,
          settings.get(SETTING_SHOW_COMPRESSED, SETTING_SHOW_COMPRESSED_DEFAULT).get()
        );
      },
      getModuleSize(module: NormalizedModule, hash: string, compressed?: boolean): Size {
        return wpJoraHelpers.getModuleSize(
          module,
          hash,
          typeof compressed === 'boolean'
            ? compressed
            : settings.get(SETTING_SHOW_COMPRESSED, SETTING_SHOW_COMPRESSED_DEFAULT).get()
        );
      },
      getAssetSize(asset: NormalizedAsset, hash: string, compressed?: boolean): Size {
        return wpJoraHelpers.getAssetSize(
          asset,
          hash,
          typeof compressed === 'boolean'
            ? compressed
            : settings.get(SETTING_SHOW_COMPRESSED, SETTING_SHOW_COMPRESSED_DEFAULT).get()
        );
      },
      setting(name: string, defaultValue: unknown) {
        return settings.get(name, defaultValue).get();
      },
      shouldHideModule(module?: NormalizedModule): boolean {
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
      shouldHideCompilation(compilation?: NormalizedCompilation) {
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
      settingShowCompressed() {
        return settings
          .get(SETTING_SHOW_COMPRESSED, SETTING_SHOW_COMPRESSED_DEFAULT)
          .get();
      },
    });

    return files;
  }) as () => PrepareFn<RawData, TargetData>;
