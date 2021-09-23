import { APIFactory } from '@statoscope/extensions';
import { RelationItem } from '@statoscope/types/types';
import { RuleDescriptor } from '@statoscope/types/types/validation/api';
import makeIndex, { IndexAPI } from '@statoscope/helpers/dist/indexer';
import { Format, Item } from './generator';

export type API = {
  getItems: (
    compilationId: string | null,
    type?: RelationItem['type'] | null,
    relatedId?: string | number
  ) => Item[];
  getItemById(id: number): Item | null;
  getRule(id: string): RuleDescriptor | null;
};

type CompilationIndexItem = {
  id: string | null;
  relationTypeIndex: IndexAPI<RelationItem['type'], TypeIndexItem>;
  itemIndex: IndexAPI<Item['id'], Item>;
};

type TypeIndexItem = {
  type: RelationItem['type'];
  relationIdIndex: IndexAPI<RelationItem['id'], IdIndexItem>;
  itemIndex: IndexAPI<Item['id'], Item>;
};

type IdIndexItem = {
  id: RelationItem['id'];
  index: IndexAPI<RelationItem['id'], Item>;
};

const makeAPI: APIFactory<Format, API> = (source) => {
  const idIndex = makeIndex((entity: Item) => entity.id);
  const compilationIndex = makeIndex((entity: CompilationIndexItem) => entity.id);
  const ruleIndex = makeIndex((item) => item.name, source.payload.rules);

  for (const compilation of source.payload.compilations) {
    let compilationItem = compilationIndex.get(compilation.id);

    if (!compilationItem) {
      compilationItem = {
        id: compilation.id,
        relationTypeIndex: makeIndex((entity: TypeIndexItem) => entity.type),
        itemIndex: makeIndex((entity: Item) => entity.id),
      };

      compilationIndex.add(compilationItem);
    }

    for (const item of compilation.items) {
      compilationItem.itemIndex.add(item);
      idIndex.add(item);

      for (const related of item.related) {
        let typeItem = compilationItem.relationTypeIndex.get(related.type);

        if (!typeItem) {
          typeItem = {
            type: related.type,
            relationIdIndex: makeIndex((entity: IdIndexItem) => entity.id),
            itemIndex: makeIndex((entity: Item) => entity.id),
          };

          compilationItem.relationTypeIndex.add(typeItem);
        }

        let idItem = typeItem.relationIdIndex.get(related.id);

        if (!idItem) {
          idItem = {
            id: related.id,
            index: makeIndex((entity: Item) => entity.id),
          };

          typeItem.relationIdIndex.add(idItem);
        }

        typeItem.itemIndex.add(item);
        idItem.index.add(item);
      }
    }
  }

  return {
    getItems: (
      compilationId: string | null,
      type?: RelationItem['type'] | null,
      relatedId?: string | number
    ): Item[] => {
      if (relatedId) {
        if (!type) {
          throw new Error('type must be specified');
        }

        return (
          compilationIndex
            .get(compilationId)
            ?.relationTypeIndex.get(type)
            ?.relationIdIndex.get(relatedId)
            ?.index.getAll() ?? []
        );
      }

      if (type) {
        return (
          compilationIndex
            .get(compilationId)
            ?.relationTypeIndex.get(type)
            ?.itemIndex.getAll() ?? []
        );
      }

      return compilationIndex.get(compilationId)?.itemIndex.getAll() ?? [];
    },
    getRule(id: string): RuleDescriptor | null {
      return ruleIndex.get(id)?.descriptor || null;
    },
    getItemById(id: number): Item | null {
      return idIndex.get(id);
    },
  };
};

export default makeAPI;
