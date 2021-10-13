import { Extension, ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import makeResolver from '@statoscope/helpers/dist/entity-resolver';
import { Report } from '@statoscope/types/types/custom-report';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version, author, homepage, description } = require('../package.json');

export type Format = Extension<Payload>;

export type Compilation = {
  id: string | null;
  reports: Array<Report<unknown, unknown>>;
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
    description,
    adapter: this.adapter,
  };
  private payload: Payload = {
    compilations: [],
  };
  private resolveCompilation = makeResolver(
    this.payload.compilations,
    (item) => item.id,
    null,
    false
  );

  constructor(private adapter?: ExtensionDescriptor) {}

  handleReport(report: Report<unknown, unknown>): boolean {
    let compilation = this.resolveCompilation(report.compilation ?? null);

    if (!compilation) {
      compilation = {
        id: report.compilation ?? null,
        reports: [],
      };
      this.payload.compilations.push(compilation);
    }

    if (compilation.reports.find((r) => r.id === report.id)) {
      return false;
    }

    compilation.reports.push(report);

    return true;
  }

  get(): Format {
    return { descriptor: this.descriptor, payload: this.payload };
  }
}
