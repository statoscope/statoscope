import path from 'path';
// @ts-ignore
import jora from 'jora';
import semverDiff from 'semver/functions/diff';
import semverGT from 'semver/functions/gt';
import semverGTE from 'semver/functions/gte';
import semverLT from 'semver/functions/lt';
import semverLTE from 'semver/functions/lte';
import semverEQ from 'semver/functions/eq';
import semverParse from 'semver/functions/parse';
import semverSatisfies from 'semver/functions/satisfies';
import { Range, SemVer } from 'semver';
import networkTypeList, { bytesInMBit, Item } from '../network-type-list';
import Graph, { Node as GraphNode, PathSolution } from '../graph';
import { colorFromH, colorMap, fileTypeMap, generateColor } from './colors';
import { pluralEng, pluralRus } from './plural';

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

export interface VersionDiffItem extends BaseDiffItem {
  type: 'version';
  a: string;
  b: string;
}

export type DiffItem = TimeDiffItem | SizeDiffItem | NumberDiffItem | VersionDiffItem;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function helpers() {
  const helpers = {
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
    formatDate(ts: number, locale?: string): string {
      return new Date(ts).toLocaleString(locale);
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

    semverGT(a: string, b: string): boolean {
      return semverGT(a, b);
    },
    semverGTE(a: string, b: string): boolean {
      return semverGTE(a, b);
    },
    semverLT(a: string, b: string): boolean {
      return semverLT(a, b);
    },
    semverLTE(a: string, b: string): boolean {
      return semverLTE(a, b);
    },
    semverEQ(a: string, b: string): boolean {
      return semverEQ(a, b);
    },
    semverDiff(a: string, b: string): string | null {
      return semverDiff(a, b);
    },
    semverParse(version?: string): SemVer | null {
      return semverParse(version);
    },
    semverSatisfies(version: string | SemVer, range: string | Range): boolean {
      return semverSatisfies(version, range);
    },

    formatDiff(value: DiffItem): string {
      if (value.type === 'size') {
        return helpers.formatSize(value.b - value.a);
      }

      if (value.type === 'time') {
        return helpers.formatDuration(value.b - value.a);
      }

      if (value.type === 'version') {
        const diff = semverDiff(value.a, value.b);
        const type = semverGT(value.a, value.b) ? 'downgrade' : 'upgrade';

        return diff ? `${diff} ${type} from ${value.a}` : '';
      }

      if (value.plural?.words) {
        return helpers.pluralWithValue(value.b - value.a, value.plural.words);
      }

      return (value.b - value.a).toString();
    },
    isMatch(a: string, b?: string | RegExp): boolean {
      return b instanceof RegExp ? b.test(a) : typeof b === 'string' ? a === b : true;
    },

    graph_getNode<TData>(id?: string, graph?: Graph<TData>): GraphNode<TData> | null {
      return graph?.getNode(id!) ?? null;
    },

    graph_getPaths<TData>(
      from?: GraphNode<TData>,
      graph?: Graph<TData>,
      to?: GraphNode<TData>,
      max = Infinity
    ): PathSolution<TData> | null {
      if (!from || !to || !graph) {
        return null;
      }

      return graph.findPaths(from, to, max);
    },
  };

  return helpers;
}

export type Prepared = {
  query: (query: string, data?: unknown, context?: unknown) => unknown;
};

export type Options = {
  helpers?: Record<string, unknown>;
};

export function prepareWithJora(input: unknown, options: Options = {}): Prepared {
  const j = jora.setup({
    ...options.helpers,
    ...helpers(),
  });

  const rootContext = {};

  return {
    query: (
      query: string,
      data: unknown = input,
      context: unknown = rootContext
    ): unknown => j(query)(data || input, context),
  };
}
