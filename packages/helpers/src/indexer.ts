import { GetIDFn, getIdWrapper, IDModifier, normalizeId } from './entity-resolver';

export type IndexAPI<TID, TEntity> = {
  add(entity: TEntity): void;
  has(entity: TEntity): boolean;
  hasId(id: TID): boolean;
  get(id: TID): TEntity | null;
  getAll(): TEntity[];
  remove(entity: TEntity): void;
  removeById(id: TID): void;
};

export type IndexOptions<TID> = {
  idModifier?: IDModifier<TID>;
};

export function sameId<TID>(id: TID): TID {
  return id;
}

function makeIdModifier<TID>(modifier: IDModifier<TID> = sameId): IDModifier<TID> {
  const cache = new Map<TID, TID>();

  return (id): TID => {
    let cached = cache.get(id);

    if (cached == null) {
      cached = modifier(id);
      cache.set(id, cached);
    }

    return cached;
  };
}

export default function makeIndex<TEntity, TID>(
  getId: GetIDFn<TID, TEntity>,
  source?: TEntity[] | null,
  options?: IndexOptions<TID>,
): IndexAPI<TID, TEntity> {
  const idModifier = makeIdModifier(options?.idModifier);
  const wrappedGet = getIdWrapper(getId, idModifier);
  const storage = new Map<TID | string, TEntity>();
  const api: IndexAPI<TID, TEntity> = {
    add(entity: TEntity) {
      storage.set(wrappedGet(entity), entity);
    },
    has(entity: TEntity): boolean {
      return storage.has(wrappedGet(entity));
    },
    hasId(id: TID): boolean {
      return storage.has(normalizeId(idModifier(id)));
    },
    get(id: TID): TEntity | null {
      return storage.get(normalizeId(idModifier(id))) ?? null;
    },
    getAll(): TEntity[] {
      return [...storage.values()];
    },
    remove(entity: TEntity) {
      storage.delete(wrappedGet(entity));
    },
    removeById(id: TID) {
      storage.delete(normalizeId(idModifier(id)));
    },
  };

  for (const item of source ?? []) {
    api.add(item);
  }

  return api;
}
