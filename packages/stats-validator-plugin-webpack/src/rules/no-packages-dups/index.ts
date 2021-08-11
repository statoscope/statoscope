import path from 'path';
import chalk from 'chalk';
import {
  NormalizedCompilation,
  NormalizedFile,
  NormalizedPackage,
} from '@statoscope/webpack-model/dist/normalize';
import { RelatedItem } from '@statoscope/stats-validator/dist/test-entry';
import { WebpackRule } from '../../';
import { ExcludeItem, normalizeExclude, serializeExclude } from '../../limits-helpers';

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
  $input: resolveInputFile();
  $exclude: #.exclude;
  
  $input.group(<compilations>)
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

  const duplicatePackages = data.query(query, data.files, {
    exclude: normalizedParams.exclude,
  }) as Result[];

  for (const item of duplicatePackages) {
    for (const packageItem of item.packages) {
      const versions = data.query('instances.version.[]', packageItem) as
        | string[]
        | undefined;
      api.error(
        `Package ${packageItem.name} has ${packageItem.instances.length} instances ${
          versions?.length ? `with ${versions.length} versions` : ''
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
            {
              type: 'discovery',
              query,
              filename: path.basename(data.files[0].name),
              serialized: {
                context: {
                  exclude: normalizedParams.exclude.map(serializeExclude),
                },
              },
              deserialize: {
                type: 'query',
                content: `
                $theContext: context;
                {
                  context: {
                    exclude: $theContext.exclude.(deserializeStringOrRegexp)
                  }
                }`,
              },
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
    .map((item) => `- ${item.path}  ${item.version ? ctx.yellow(item.version) : ''}`)
    .join('\n');
}

export default noPackagesDups;
