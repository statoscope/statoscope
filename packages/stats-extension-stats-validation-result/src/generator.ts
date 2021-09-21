import { Extension, ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import makeResolver from '@statoscope/helpers/dist/entity-resolver';
import { TestEntry } from '@statoscope/types/types/validation/test-entry';
import {
  RelatedItem,
  DetailsDescriptor,
} from '@statoscope/types/types/validation/test-entry';
import { RuleDescriptor } from '@statoscope/types/types/validation/api';
import { NormalizedExecParams } from '@statoscope/types/types/validation/rule';
import { author, description, homepage, name, version } from './version';

export type Format = Extension<Payload>;
export type Item = {
  id: number;
  type: NormalizedExecParams['mode'];
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
  rules: Array<{ name: string; descriptor: RuleDescriptor }>;
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
    rules: [],
  };
  private resolveCompilation = makeResolver(
    this.payload.compilations,
    (item) => item.id,
    null,
    false
  );

  constructor(private adapter?: ExtensionDescriptor) {}

  handleRule(name: string, descriptor: RuleDescriptor): void {
    const existingRule = this.payload.rules.find((rule) => name === rule.name);

    if (!existingRule) {
      this.payload.rules.push({ name, descriptor });
    }
  }

  handleEntry(
    ruleName: string,
    entry: TestEntry,
    type?: NormalizedExecParams['mode']
  ): void {
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
      type: type ?? 'error',
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
