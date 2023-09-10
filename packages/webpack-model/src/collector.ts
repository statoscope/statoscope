import type { Webpack } from '../webpack';
import type { EntrypointItem } from '../types';

export function collector<TResult, TID, TEntry = TResult>(
  from: TEntry[],
  isItem: (entry: TEntry) => boolean,
  getChildren: (entry: TEntry) => TEntry[],
  getId: (item: TResult) => TID,
): Map<TID, TResult> {
  const stack: TEntry[][] = [from];
  let cursor: Array<TEntry> | undefined;
  const collected = new Map<TID, TResult>();

  while ((cursor = stack.pop())) {
    for (let i = 0; i < cursor.length; i++) {
      const item = cursor[i];
      if (isItem(item)) {
        collected.set(getId(item as unknown as TResult), item as unknown as TResult);
      } else {
        stack.push(getChildren(item));
      }
    }
  }

  return collected;
}

export function collectRawModules(compilation: Webpack.Compilation): Webpack.RawModule[] {
  const collected = collectRawModulesFromArray(compilation.modules ?? []);

  for (const chunk of compilation.chunks ?? []) {
    const innerCollected = collectRawModulesFromArray(chunk.modules ?? []);

    for (const [innerId, innerItem] of innerCollected) {
      if (!collected.has(innerId)) {
        collected.set(innerId, innerItem);
      }
    }
  }

  for (const [, item] of collected) {
    const innerCollected = collectRawModulesFromArray(item.modules ?? []);

    for (const [innerId, innerItem] of innerCollected) {
      if (!collected.has(innerId)) {
        collected.set(innerId, innerItem);
      }
    }
  }

  return [...collected.values()];
}

export function collectRawModulesFromArray(
  modules: Webpack.Module[],
): Map<string, Webpack.RawModule> {
  return collector<Webpack.RawModule, string, Webpack.Module>(
    modules,
    (module) => module.type === 'module' || typeof module.type === 'undefined',
    (module) => (module as Webpack.ModuleGroup).children,
    (module) => module.identifier,
  );
}

export function collectRawAssetsFromArray(
  assets: Webpack.Asset[],
): Map<string, Webpack.RawAsset> {
  return collector<Webpack.RawAsset, string, Webpack.Asset>(
    assets,
    (asset) => asset.type === 'asset' || typeof asset.type === 'undefined',
    (asset) => (asset as Webpack.AssetGroup).children,
    (asset) => asset.name,
  );
}

export function collectRawReasonsFromArray(
  modules: Webpack.Reason[],
): Map<number, Webpack.RawReason> {
  let i = 0;

  return collector<Webpack.RawReason, number, Webpack.Reason>(
    modules,
    (reason) => (reason as Webpack.RawReason).moduleIdentifier !== undefined,
    (reasons) => (reasons as Webpack.ReasonGroup).children,
    () => i++,
  );
}

export function collectRawChunks(compilation: Webpack.Compilation): Webpack.Chunk[] {
  const chunks: Webpack.Chunk[] = [];

  for (const chunk of compilation.chunks ?? []) {
    chunks.push(chunk);
  }

  return chunks;
}

export function collectRawAssets(compilation: Webpack.Compilation): Webpack.RawAsset[] {
  return [...collectRawAssetsFromArray(compilation.assets ?? []).values()];
}

export function collectRawEntrypoints(
  compilation: Webpack.Compilation,
): EntrypointItem[] {
  const entrypoints: EntrypointItem[] = [];

  for (const [name, data] of Object.entries(compilation.entrypoints ?? {})) {
    entrypoints.push({ name, data });
  }

  return entrypoints;
}
