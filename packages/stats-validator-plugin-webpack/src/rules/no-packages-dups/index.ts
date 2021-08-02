import chalk from 'chalk';
import {
  NormalizedCompilation,
  NormalizedFile,
  NormalizedPackage,
} from '@statoscope/webpack-model/dist/normalize';
import { RelatedItem } from '@statoscope/stats-validator/dist/test-entry';
import { WebpackRule } from '../../';
import { ExcludeItem, normalizeExclude } from '../../limits-helpers';

export type RuleExcludeItem = ExcludeItem<'compilation' | 'package'>;

export type NormalizedParams = {
  exclude: RuleExcludeItem[];
};

export type Params = {
  exclude?: Array<string | RegExp | RuleExcludeItem>;
};

export type Result = {
  file: NormalizedFile;
  compilation: NormalizedCompilation;
  packages: NormalizedPackage[];
};

const noPackagesDups: WebpackRule<Params> = (ruleParams, data, api): void => {
  const normalizedParams: NormalizedParams = {
    exclude: ruleParams?.exclude?.map((item) => normalizeExclude(item, 'package')) ?? [],
  };
  const query = `
  $exclude: #.exclude;
  .group(<compilations>)
  .({file: value.pick(), compilation: key})
  .exclude({
    exclude: $exclude.[type='compilation'].name,
    get: <compilation.name>,
  })
  .({
    ...$,
    packages: compilation
    .nodeModules
    .exclude({
      exclude: $exclude.[type='package'].name,
      get: <name>,
    })
    .[instances.size() > 1]
    .({
      ...$,
      instances: instances.sort(isRoot desc, path.size() asc)
    })
    .sort(instances.size() desc, name asc)
  })
  .[packages]`;
  const duplicatePackages = data.input.query(query, data.input.files, {
    exclude: normalizedParams.exclude,
  }) as Result[];

  for (const item of duplicatePackages) {
    for (const packageItem of item.packages) {
      const versions = data.input.query('instances.version.[]', packageItem) as string[];
      api.error(
        `Package ${packageItem.name} has ${packageItem.instances.length} instances ${
          versions.length ? `with ${versions.length} versions` : ''
        }`,
        {
          filename: item.file.name,
          compilation: item.compilation.name || item.compilation.hash,
          details: [
            {
              type: 'text',
              content: makeDetailsContent(packageItem, false),
            },
            {
              type: 'tty',
              content: makeDetailsContent(packageItem, true),
            },
          ],
          related: [
            { type: 'package', id: packageItem.name },
            ...packageItem.instances.map(
              (instance): RelatedItem => ({
                type: 'package-instance',
                id: instance.path,
              })
            ),
          ],
        }
      );
    }
  }
};

function makeDetailsContent(packageItem: NormalizedPackage, tty: boolean): string {
  const ctx = new chalk.Instance(tty ? {} : { level: 0 });

  return packageItem.instances
    .map((item) => `- ${item.path}  ${ctx.yellow(item.version) ?? ''}`)
    .join('\n');
}

export default noPackagesDups;
