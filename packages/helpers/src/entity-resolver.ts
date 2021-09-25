export function normalizeId<TID>(id: TID): TID | string {
  return typeof id === 'number' || typeof id === 'bigint' ? String(id) : id;
}

export function getIdWrapper<TID, TEntity>(
  getId: GetIDFn<TID, TEntity>
): GetIDFn<TID | string, TEntity> {
  return (entity): TID | string => {
    const id = getId(entity);
    return normalizeId(id);
  };
}

function warnCache<TID, TEntity>(
  entities: Entities<TEntity>,
  getId: GetIDFn<TID, TEntity>,
  cache: Map<TID | string, TEntity>
): void {
  cache.clear();

  if (Array.isArray(entities) || entities instanceof Set) {
    for (const entity of entities) {
      cache.set(getId(entity), entity);
    }
  } else if (entities instanceof Map) {
    for (const [, entity] of entities) {
      cache.set(getId(entity), entity);
    }
  } else {
    for (const name in entities) {
      const entity = entities[name];
      cache.set(getId(entity), entity);
    }
  }
}

export type Entities<TEntity> =
  | TEntity[]
  | Set<TEntity>
  | Map<unknown, TEntity>
  | Record<string, TEntity>;

export type ResolverAPI = {
  lock(): void;
  unlock(): void;
};

export type ResolverFn<TID, TReturn> = (id: TID) => TReturn | null;

export type Resolver<TID, TReturn> = ResolverFn<TID, TReturn> & ResolverAPI;

export type GetIDFn<TID, TEntity> = (entity: TEntity) => TID;

export default function makeResolver<TID, TEntity, TReturn = TEntity>(
  entities: Entities<TEntity>,
  getId: (entity: TEntity) => TID,
  get?: ((entity: TEntity) => TReturn) | null,
  locked = true
): Resolver<TID, TReturn> {
  const wrappedGetId = getIdWrapper(getId);
  const cache: Map<TID | string, TEntity> = new Map();

  warnCache(entities, wrappedGetId, cache);

  const resolver: Resolver<TID, TReturn> = (id): TReturn | null => {
    const idForCache = normalizeId(id);
    const cached = cache.get(idForCache);

    if (cached) {
      return (get ? get(cached) : cached) as TReturn;
    } else if (locked) {
      return null;
    }

    let result: TEntity | null = null;

    if (Array.isArray(entities) || entities instanceof Set) {
      for (const entity of entities) {
        if (getId(entity) === id) {
          result = entity;
          break;
        }
      }
    } else if (entities instanceof Map) {
      for (const [, entity] of entities) {
        if (getId(entity) === id) {
          result = entity;
          break;
        }
      }
    } else {
      for (const name in entities) {
        const entity = entities[name];

        if (getId(entity) === id) {
          result = entity;
          break;
        }
      }
    }

    if (result) {
      cache.set(id, result);
      return (get ? get(result) : result) as TReturn;
    }

    return null;
  };

  resolver.lock = (): void => {
    warnCache(entities, wrappedGetId, cache);
    locked = true;
  };
  resolver.unlock = (): void => void (locked = false);

  return resolver;
}
