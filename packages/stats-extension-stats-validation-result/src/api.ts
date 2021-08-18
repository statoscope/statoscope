import makeEntityResolver from '@statoscope/helpers/dist/entity-resolver';
import { Resolver } from '@statoscope/helpers/dist/entity-resolver';
import { APIFactory } from '@statoscope/extensions';
import { RelatedItem, RuleDescriptor } from '@statoscope/types/types/validation';
import { Format, Item } from './generator';

export type API = {
  getItems: (
    compilationId: string | null,
    type?: RelatedItem['type'] | null,
    relatedId?: string | number
  ) => Item[];
  getItemById(id: number): Item | null;
  getRule(id: string): RuleDescriptor | null;
};

type IndexItem = { item: Item; related: RelatedItem };
type Index = {
  type: RelatedItem['type'];
  links: IndexItem[];
  items: Item[];
  related: RelatedItem[];
  byRelatedId: Resolver<string | number, Item>;
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
    byRelatedId: makeEntityResolver(
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
  const resolveRule = makeEntityResolver(
    source.payload.rules,
    (item) => item.name,
    (item) => item.descriptor
  );
  const items: Item[] = [];
  const resolveItemById = makeEntityResolver(items, (item) => item.id);
  for (const compilation of source.payload.compilations) {
    const indexes: IndexAPI[] = [];
    const compilationData: CompilationData = {
      id: compilation.id,
      items: compilation.items,
      resolveIndex: makeEntityResolver(indexes, (index) => index.type),
    };
    compilationResolvers.push(compilationData);

    for (const item of compilation.items) {
      items.push(item);
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
      type?: RelatedItem['type'] | null,
      relatedId?: string | number
    ): Item[] => {
      if (relatedId) {
        if (!type) {
          throw new Error('type must be specified');
        }

        return (
          resolveCompilationsResolvers(compilationId)
            ?.resolveIndex(type)
            ?.getItems(relatedId) ?? []
        );
      }

      if (type) {
        return (
          resolveCompilationsResolvers(compilationId)?.resolveIndex(type)?.getItems() ??
          []
        );
      }

      return resolveCompilationsResolvers(compilationId)?.items ?? [];
    },
    getRule(id: string): RuleDescriptor | null {
      return resolveRule(id);
    },
    getItemById(id: number): Item | null {
      return resolveItemById(id);
    },
  };
};

export default makeAPI;
