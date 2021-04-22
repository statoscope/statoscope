function warnCache(entities, getId, cache) {
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

export function makeEntityResolver(entities, getId) {
  const cache = new Map();

  warnCache(entities, getId, cache)

  return (id) => {
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

        if (getId(entity === id)) {
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
