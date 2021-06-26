import path from 'path';
import networkTypeList, { bytesInMBit, Item } from '../network-type-list';
import { colorFromH, colorMap, fileTypeMap, generateColor } from './colors';
import { pluralEng, pluralRus } from './plural';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default () => {
  return {
    stringify: JSON.stringify,
    toNumber(str: string): number {
      return parseInt(str, 10);
    },
    formatSize(value: number): string {
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
    formatDate(ts: number): string {
      return new Date(ts).toLocaleString();
    },
    formatDuration(ms: number): string {
      const sign = Math.sign(ms);
      ms = Math.abs(ms);

      if (isFinite(ms)) {
        if (ms < 1000) {
          return (sign * ms).toFixed(0) + ' ms';
        }

        return (sign * (ms / 1000)).toFixed(1) + ' sec';
      }
      return 'n/a';
    },
    percentFrom(a: number, b: number, toFixed?: number): number {
      if (a && !b) {
        return 100;
      }

      if (!a && !b) {
        return 0;
      }

      const p = (a / b - 1) * 100;

      if (typeof toFixed !== 'undefined') {
        return Number(p.toFixed(toFixed));
      }

      return p;
    },
    toFixed(value: number, digits = 2): string {
      return value.toFixed(digits);
    },
    color: (value: string): string =>
      colorMap[value] ? colorMap[value].color : generateColor(value),
    fileExt: (value?: string): string => {
      if (value == null) {
        return '';
      }

      return path.extname(value);
    },
    fileType: (value?: string): string => {
      if (value == null) {
        return '';
      }

      const extname = path.extname(value);
      return fileTypeMap[extname] || extname;
    },
    toMatchRegexp: (value: string, rx: RegExp): boolean => rx.test(value),
    toRegexp: (value: string): RegExp => new RegExp(`(${value})`),
    colorFromH: colorFromH,
    plural(value: number, words: string[]): string {
      return pluralEng.plural(value, words);
    },
    pluralWithValue(value: number, words: string[]): string {
      return pluralEng.pluralWithValue(value, words);
    },
    pluralRus(value: number, words: string[]): string {
      return pluralRus.plural(value, words);
    },
    pluralWithValueRus(value: number, words: string[]): string {
      return pluralRus.pluralWithValue(value, words);
    },
    getNetworkTypeInfo(networkType: string): Item | null {
      return networkTypeList.find((item) => item.name === networkType) ?? null;
    },
    getNetworkTypeName(networkType: Item): string | null {
      return `${networkType.type}: ${networkType.name} (${parseFloat(
        (networkType.typicalSpeed / bytesInMBit).toFixed(1)
      )} MBit/s)`;
    },
    getDownloadTime(size: number, networkType: string): number {
      const item = networkTypeList.find((item) => item.name === networkType);

      if (item) {
        return (size / item.typicalSpeed) * 1000;
      }

      throw new Error(`Unknown network type ${networkType}`);
    },
  };
};
