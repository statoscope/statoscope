import { SerializedStringOrRegexp } from '@statoscope/helpers/dist/jora';

export type ExcludeItem<TType> = {
  type: TType;
  name: string | RegExp;
};

export type SerializedExcludeItem<TType> = {
  type: TType;
  name: SerializedStringOrRegexp;
};

export type ByNameFilterItem<TLimit> = {
  name: string | RegExp;
  limits: TLimit;
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export function normalizeExclude<TType>(
  item: string | RegExp | ExcludeItem<TType>,
  defaultType: TType
): ExcludeItem<TType> {
  if (typeof item === 'string' || item instanceof RegExp) {
    return {
      type: defaultType,
      name: item,
    };
  }

  return item;
}

export function serializeExclude<TType>(
  item: ExcludeItem<TType>
): SerializedExcludeItem<TType> {
  let name: SerializedExcludeItem<TType>['name'];

  if (item.name instanceof RegExp) {
    name = { type: 'regexp', content: item.name.source, flags: item.name.flags };
  } else {
    name = { type: 'string', content: item.name };
  }

  return { type: item.type, name };
}
