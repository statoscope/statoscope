import makeEntityResolver from '@statoscope/helpers/dist/entity-resolver';
import { Resolver } from '@statoscope/helpers/dist/entity-resolver';
import { APIFactory } from '@statoscope/extensions';
import { RelatedItem } from '@statoscope/stats-validator/dist/test-entry';
import { Format, Item } from './generator';

export type API = {
  getItems: (
    compilationId: string | null,
    type: RelatedItem['type'],
    relatedId?: string | number
  ) => Item[];
};

type IndexItem = { item: Item; related: RelatedItem };
type Index = {
  type: RelatedItem['type'];
  links: IndexItem[];
  items: Item[];
  related: RelatedItem[];
  resolveItem: Resolver<string | number, Item>;
};

export type IndexAPI = {
  readonly type: RelatedItem['type'];
  add(item: Item, related: RelatedItem): void;
  getItems(id?: string | number): Item[];
};

function makeIndex(type: RelatedItem['type']): IndexAPI {
  const links: IndexItem[] = [];
  const index: Index = {
    type,
    links,
    items: [],
    related: [],
    resolveItem: makeEntityResolver(
      links,
      (item) => item.related.id,
      (item) => item.item
    ),
  };

  return {
    type,
    add(item: Item, related: RelatedItem): void {
      if (!index.items.includes(item)) {
        index.items.push(item);
      }

      if (!index.related.includes(related)) {
        index.related.push(related);
      }

      if (!index.links.find((link) => link.item === item && link.related === related)) {
        index.links.push({ item, related });
      }
    },
    getItems(id?: string | number): Item[] {
      if (id != null) {
        return (
          index.links
            // eslint-disable-next-line eqeqeq
            .filter((link) => link.related.id == id)
            .map((link) => link.item)
        );
      }

      return index.items;
    },
  };
}

export type CompilationData = {
  id: string | null;
  items: Item[];
  resolveIndex: Resolver<RelatedItem['type'], IndexAPI>;
};

const makeAPI: APIFactory<Format, API> = (source) => {
  const compilationResolvers: CompilationData[] = [];
  const resolveCompilationsResolvers = makeEntityResolver(
    compilationResolvers,
    (item) => item.id
  );

  for (const compilation of source.payload.compilations) {
    const indexes: IndexAPI[] = [];
    const compilationData: CompilationData = {
      id: compilation.id,
      items: compilation.items,
      resolveIndex: makeEntityResolver(indexes, (index) => index.type),
    };
    compilationResolvers.push(compilationData);

    for (const item of compilation.items) {
      for (const related of item.related) {
        let index = compilationData.resolveIndex(related.type);

        if (!index) {
          index = makeIndex(related.type);
          indexes.push(index);
        }

        index.add(item, related);
      }
    }
  }

  return {
    getItems: (
      compilationId: string | null,
      type: RelatedItem['type'],
      relatedId?: string | number
    ): Item[] => {
      if (relatedId) {
        return (
          resolveCompilationsResolvers(compilationId)
            ?.resolveIndex(type)
            ?.getItems(relatedId) ?? []
        );
      }

      return (
        resolveCompilationsResolvers(compilationId)?.resolveIndex(type)?.getItems() ?? []
      );
    },
  };
};

export default makeAPI;
