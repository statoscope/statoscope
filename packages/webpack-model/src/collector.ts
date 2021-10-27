import { Webpack } from '../webpack';
import type { EntrypointItem } from '../types';
import Module = Webpack.Module;
import ModuleGroup = Webpack.ModuleGroup;
import RawModule = Webpack.RawModule;
import Compilation = Webpack.Compilation;
import Chunk = Webpack.Chunk;
import Asset = Webpack.Asset;

export function collector<TResult, TID, TEntry = TResult>(
  from: TEntry[],
  isItem: (entry: TEntry) => boolean,
  getChildren: (entry: TEntry) => TEntry[],
  getId: (item: TResult) => TID
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

export function collectRawModules(compilation: Compilation): RawModule[] {
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
    if (!collected.has(item.identifier)) {
      collected.set(item.identifier, item);
    }

    for (const innerModule of item.modules ?? []) {
      if (!collected.has(innerModule.identifier)) {
        collected.set(innerModule.identifier, innerModule);
      }
    }
  }

  return [...collected.values()];
}

export function collectRawModulesFromArray(modules: Module[]): Map<string, RawModule> {
  return collector<RawModule, string, Module>(
    modules,
    (module) => module.type === 'module' || typeof module.type === 'undefined',
    (module) => (module as ModuleGroup).children,
    (module) => module.identifier
  );
}

export function collectRawChunks(compilation: Compilation): Chunk[] {
  const chunks: Chunk[] = [];

  for (const chunk of compilation.chunks ?? []) {
    chunks.push(chunk);
  }

  return chunks;
}

export function collectRawAssets(compilation: Compilation): Asset[] {
  const assets: Asset[] = [];

  for (const asset of compilation.assets ?? []) {
    assets.push(asset);
  }

  return assets;
}

export function collectRawEntrypoints(compilation: Compilation): EntrypointItem[] {
  const entrypoints: EntrypointItem[] = [];

  for (const [name, data] of Object.entries(compilation.entrypoints ?? {})) {
    entrypoints.push({ name, data });
  }

  return entrypoints;
}
