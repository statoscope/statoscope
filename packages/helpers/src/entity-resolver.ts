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

export default function makeResolver<TID, TEntity, TReturn = TEntity>(
  entities: Entities<TEntity>,
  getId: (entity: TEntity) => TID,
  get?: (entity: TEntity) => TReturn
): Resolver<TID, TReturn> {
  const cache = new Map();

  warnCache(entities, getId, cache);

  return (id: TID): TReturn | null => {
    const cached = cache.get(id);

    if (cached) {
      return get ? get(cached) : cached;
    }

    let result: TEntity | null = null;

    if (Array.isArray(entities) || entities instanceof Set) {
      for (const entity of entities) {
        // disable eqeqeq cause id may be string or number
        // eslint-disable-next-line eqeqeq
        if (getId(entity) == id) {
          result = entity;
          break;
        }
      }
    } else if (entities instanceof Map) {
      for (const [, entity] of entities) {
        // eslint-disable-next-line eqeqeq
        if (getId(entity) == id) {
          result = entity;
          break;
        }
      }
    } else {
      for (const name in entities) {
        const entity = entities[name];

        // eslint-disable-next-line eqeqeq
        if (getId(entity) == id) {
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
}
