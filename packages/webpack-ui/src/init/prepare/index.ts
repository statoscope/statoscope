import { joraHelpers as webpackJoraHelpers, normalize } from '@statoscope/webpack-model';
import { jora as joraHelpers } from '@statoscope/helpers';
import { Node } from '@statoscope/webpack-model/dist/modules-to-foam-tree';
import {
  NormalizedAsset,
  NormalizedCompilation,
  NormalizedModule,
} from '@statoscope/webpack-model/dist/normalize';
import type { Size } from '@statoscope/stats-extension-compressed/dist/generator';
import type { Instance } from '@statoscope/stats-extension-package-info/dist/generator';
import settings, {
  SETTING_ASSETS_INJECT_TYPE,
  SETTING_ASSETS_INJECT_TYPE_DEFAULT,
  SETTING_HIDE_CHILD_COMPILATIONS,
  SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT,
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
  SETTING_NETWORK_SPEED,
  SETTING_NETWORK_SPEED_DEFAULT,
  SETTING_SHOW_COMPRESSED,
  SETTING_SHOW_COMPRESSED_DEFAULT,
} from '../../settings';
import { PrepareFn, RawData, StatoscopeWidget, TargetData } from '../../../types';
import networkTypeList, { bytesInMBit, Item } from '../../network-type-list';

export interface BaseDiffItem {
  id?: string;
  title?: string;
}

export interface TimeDiffItem extends BaseDiffItem {
  type: 'time';
  a: number;
  b: number;
}

export interface SizeDiffItem extends BaseDiffItem {
  type: 'size';
  a: number;
  b: number;
}

export interface NumberDiffItem extends BaseDiffItem {
  type: 'number';
  a: number;
  b: number;
  plural?: { words: string[] };
}

export type DiffItem = TimeDiffItem | SizeDiffItem | NumberDiffItem;

export default (() =>
  (rawData: RawData, { addQueryHelpers }: StatoscopeWidget): unknown => {
    const { files, compilations } = normalize(rawData);
    const wpJoraHelpers = webpackJoraHelpers(compilations);
    const commonJoraHelpers = joraHelpers();

    addQueryHelpers({
      ...wpJoraHelpers,
      ...commonJoraHelpers,
      formatDiff(value: DiffItem): string {
        if (value.type === 'size') {
          return commonJoraHelpers.formatSize(value.b - value.a);
        }

        if (value.type === 'time') {
          return commonJoraHelpers.formatDuration(value.b - value.a);
        }

        if (value.plural?.words) {
          return commonJoraHelpers.pluralWithValue(value.b - value.a, value.plural.words);
        }

        return (value.b - value.a).toString();
      },
      encodeURIComponent: encodeURIComponent,
      decodeURIComponent: decodeURIComponent,
      modulesToFoamTree(modules: NormalizedModule[], hash?: string): Node {
        return wpJoraHelpers.modulesToFoamTree(
          modules,
          settings.get(SETTING_SHOW_COMPRESSED, SETTING_SHOW_COMPRESSED_DEFAULT).get(),
          hash
        );
      },
      getModuleSize(module: NormalizedModule, hash: string, compressed?: boolean): Size {
        return wpJoraHelpers.getModuleSize(
          module,
          typeof compressed === 'boolean'
            ? compressed
            : settings
                .get(SETTING_SHOW_COMPRESSED, SETTING_SHOW_COMPRESSED_DEFAULT)
                .get(),
          hash
        );
      },
      getAssetSize(asset: NormalizedAsset, hash: string, compressed?: boolean): Size {
        return wpJoraHelpers.getAssetSize(
          asset,
          typeof compressed === 'boolean'
            ? compressed
            : settings
                .get(SETTING_SHOW_COMPRESSED, SETTING_SHOW_COMPRESSED_DEFAULT)
                .get(),
          hash
        );
      },
      getInstanceInfo(
        packageName: string,
        instancePath: string,
        hash: string
      ): Instance | null {
        return wpJoraHelpers.getInstanceInfo(packageName, instancePath, hash);
      },
      getNetworkTypeInfo(networkType: string): Item | null {
        return networkTypeList.find((item) => item.name === networkType) ?? null;
      },
      getNetworkTypeName(networkType: Item): string | null {
        return `${networkType.type}: ${networkType.name} (${parseFloat(
          (networkType.typicalSpeed / bytesInMBit).toFixed(1)
        )} MBit/s)`;
      },
      getDownloadTime(size: number, networkType?: string): number {
        if (networkType == null) {
          networkType = settings
            .get(SETTING_NETWORK_SPEED, SETTING_NETWORK_SPEED_DEFAULT)
            .get();
        }
        const item = networkTypeList.find((item) => item.name === networkType);

        if (item) {
          return (size / item.typicalSpeed) * 1000;
        }

        throw new Error(`Unknown network type ${networkType}`);
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
      settingNetworkType() {
        return settings.get(SETTING_NETWORK_SPEED, SETTING_NETWORK_SPEED_DEFAULT).get();
      },
      settingAssetsInjectType() {
        return settings
          .get(SETTING_ASSETS_INJECT_TYPE, SETTING_ASSETS_INJECT_TYPE_DEFAULT)
          .get();
      },
    });

    return files;
  }) as () => PrepareFn<RawData, TargetData>;
