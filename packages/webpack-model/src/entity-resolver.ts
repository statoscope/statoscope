function warnCache<TID, TEntity>(
  entities: Entities<TEntity>,
  getId: GetIDFn<TID, TEntity>,
  cache: Map<TID, TEntity>
): void {
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

export type Resolver<TID, TEntity> = (id: TID) => TEntity | null;

export type GetIDFn<TID, TEntity> = (entity: TEntity) => TID;

export default function make<TID, TEntity>(
  entities: Entities<TEntity>,
  getId: (entity: TEntity) => TID
): Resolver<TID, TEntity> {
  const cache = new Map();

  warnCache(entities, getId, cache);

  return (id: TID): TEntity | null => {
    const cached = cache.get(id);

    if (cached) {
      return cached;
    }

    let result = null;

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
    }

    return result;
  };
}
