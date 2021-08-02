import { Extension, ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import makeResolver from '@statoscope/helpers/dist/entity-resolver';
import {
  DetailsDescriptorDiscovery,
  RelatedItem,
  TestEntry,
  Type,
} from '@statoscope/stats-validator/dist/test-entry';
import { name, version, author, homepage } from './version';

export type Format = Extension<Payload>;
export type Item = {
  type: Type;
  rule: string;
  message: string;
  details: DetailsDescriptorDiscovery[];
  related: RelatedItem[];
};
export type Compilation = {
  id: string | null;
  items: Item[];
};
export type Payload = {
  compilations: Array<Compilation>;
};

export default class Generator {
  private descriptor: ExtensionDescriptor = {
    name,
    version,
    author,
    homepage,
    adapter: this.adapter,
  };
  private payload: Payload = { compilations: [] };
  private resolveCompilation = makeResolver(this.payload.compilations, (item) => item.id);

  constructor(private adapter?: ExtensionDescriptor) {}

  handleEntry(ruleName: string, entry: TestEntry): void {
    let compilation = this.resolveCompilation(entry.compilation ?? null);

    if (!compilation) {
      compilation = {
        id: entry.compilation ?? null,
        items: [],
      };
      this.payload.compilations.push(compilation);
    }

    compilation.items.push({
      rule: ruleName,
      type: entry.type ?? 'error',
      message: entry.message,
      details: (Array.isArray(entry.details)
        ? entry.details.filter((item) => item.type === 'discovery')
        : []) as DetailsDescriptorDiscovery[],
      related: entry.related ?? [],
    });
  }

  get(): Format {
    return { descriptor: this.descriptor, payload: this.payload };
  }
}
