import { APIFactory } from '@statoscope/extensions';
import { RelationItem } from '@statoscope/types';
import makeIndex, { IndexAPI } from '@statoscope/helpers/dist/indexer';
import { Report } from '@statoscope/types/types/custom-report';
import { Format } from './generator';

export type API = {
  getReports: (
    compilationId?: string | null,
    type?: RelationItem['type'] | null,
    relatedId?: string | number
  ) => Report<unknown, unknown>[];
  getById(id: string): Report<unknown, unknown> | null;
};

type CompilationIndexItem = {
  id: string | null;
  relationTypeIndex: IndexAPI<RelationItem['type'], TypeIndexItem>;
  itemIndex: IndexAPI<Report<unknown, unknown>['id'], Report<unknown, unknown>>;
};

type TypeIndexItem = {
  type: RelationItem['type'];
  relationIdIndex: IndexAPI<RelationItem['id'], IdIndexItem>;
  itemIndex: IndexAPI<Report<unknown, unknown>['id'], Report<unknown, unknown>>;
};

type IdIndexItem = {
  id: RelationItem['id'];
  index: IndexAPI<RelationItem['id'], Report<unknown, unknown>>;
};

const makeAPI: APIFactory<Format, API> = (source) => {
  const idIndex = makeIndex((entity: Report<unknown, unknown>) => entity.id);
  const compilationIndex = makeIndex((entity: CompilationIndexItem) => entity.id);

  for (const compilation of source.payload.compilations) {
    let compilationItem = compilationIndex.get(compilation.id);

    if (!compilationItem) {
      compilationItem = {
        id: compilation.id,
        relationTypeIndex: makeIndex((entity: TypeIndexItem) => entity.type),
        itemIndex: makeIndex((entity: Report<unknown, unknown>) => entity.id),
      };

      compilationIndex.add(compilationItem);
    }

    for (const item of compilation.reports) {
      compilationItem.itemIndex.add(item);
      idIndex.add(item);

      for (const related of item.relations ?? []) {
        let typeItem = compilationItem.relationTypeIndex.get(related.type);

        if (!typeItem) {
          typeItem = {
            type: related.type,
            relationIdIndex: makeIndex((entity: IdIndexItem) => entity.id),
            itemIndex: makeIndex((entity: Report<unknown, unknown>) => entity.id),
          };

          compilationItem.relationTypeIndex.add(typeItem);
        }

        let idItem = typeItem.relationIdIndex.get(related.id);

        if (!idItem) {
          idItem = {
            id: related.id,
            index: makeIndex((entity: Report<unknown, unknown>) => entity.id),
          };

          typeItem.relationIdIndex.add(idItem);
        }

        typeItem.itemIndex.add(item);
        idItem.index.add(item);
      }
    }
  }

  return {
    getReports: (
      compilationId: string | null = null,
      type?: RelationItem['type'] | null,
      relatedId?: string | number
    ): Report<unknown, unknown>[] => {
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
    getById(id: string): Report<unknown, unknown> | null {
      return idIndex.get(id);
    },
  };
};

export default makeAPI;
