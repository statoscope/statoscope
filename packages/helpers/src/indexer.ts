import { GetIDFn, getIdWrapper, normalizeId } from './entity-resolver';

export type IndexAPI<TID, TEntity> = {
  add(entity: TEntity): void;
  has(entity: TEntity): boolean;
  hasId(id: TID): boolean;
  get(id: TID): TEntity | null;
  getAll(): TEntity[];
  remove(entity: TEntity): void;
  removeById(id: TID): void;
};

export default function makeIndex<TEntity, TID>(
  getId: GetIDFn<TID, TEntity>,
  source?: TEntity[]
): IndexAPI<TID, TEntity> {
  const wrappedGet = getIdWrapper(getId);
  const storage = new Map<TID | string, TEntity>();
  const api: IndexAPI<TID, TEntity> = {
    add(entity: TEntity) {
      storage.set(wrappedGet(entity), entity);
    },
    has(entity: TEntity): boolean {
      return storage.has(wrappedGet(entity));
    },
    hasId(id: TID): boolean {
      return storage.has(normalizeId(id));
    },
    get(id: TID): TEntity | null {
      return storage.get(normalizeId(id)) ?? null;
    },
    getAll(): TEntity[] {
      return [...storage.values()];
    },
    remove(entity: TEntity) {
      storage.delete(wrappedGet(entity));
    },
    removeById(id: TID) {
      storage.delete(normalizeId(id));
    },
  };

  for (const item of source ?? []) {
    api.add(item);
  }

  return api;
}
