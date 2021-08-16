import {
  Extension,
  ExtensionDescriptor,
  PackageDescriptor,
} from '@statoscope/stats/spec/extension';
import makeResolver from '@statoscope/helpers/dist/entity-resolver';
import {
  DetailsDescriptor,
  RelatedItem,
  TestEntry,
  Type,
} from '@statoscope/types/types/validation';
import { name, version, author, homepage, description } from './version';

export type Format = Extension<Payload>;
export type Item = {
  id: number;
  type: Type;
  rule: string;
  message: string;
  details: DetailsDescriptor[];
  related: RelatedItem[];
};
export type Compilation = {
  id: string | null;
  items: Item[];
};
export type Payload = {
  rules: Map<string, PackageDescriptor>;
  compilations: Array<Compilation>;
};

export default class Generator {
  private lastId = 0;
  private descriptor: ExtensionDescriptor = {
    name,
    version,
    author,
    homepage,
    description,
    adapter: this.adapter,
  };
  private payload: Payload = {
    compilations: [],
    rules: new Map<string, PackageDescriptor>(),
  };
  private resolveCompilation = makeResolver(this.payload.compilations, (item) => item.id);

  constructor(private adapter?: ExtensionDescriptor) {}

  handleRule(ruleDescriptor: PackageDescriptor): void {
    this.payload.rules.set(ruleDescriptor.name, ruleDescriptor);
  }

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
      id: this.lastId++,
      rule: ruleName,
      type: entry.type ?? 'error',
      message: entry.message,
      details: (entry.details == null
        ? []
        : Array.isArray(entry.details)
        ? entry.details
        : ([{ type: 'text', content: entry.details }] as DetailsDescriptor[])
      ).filter((item) => item.type === 'discovery'),
      related: entry.related ?? [],
    });
  }

  get(): Format {
    return { descriptor: this.descriptor, payload: this.payload };
  }
}
