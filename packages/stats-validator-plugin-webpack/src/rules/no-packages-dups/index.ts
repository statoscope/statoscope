import chalk from 'chalk';
import {
  NormalizedCompilation,
  NormalizedFile,
  NormalizedPackage,
} from '@statoscope/webpack-model/dist/normalize';
import { WebpackRule } from '../../';

export type Params = { exclude?: string[] };

export type Result = {
  file: NormalizedFile;
  compilation: NormalizedCompilation;
  packages: NormalizedPackage[];
};

const noPackagesDups: WebpackRule<Params> = (ruleParams, data, api): void => {
  const duplicatePackages = data.query(
    `
    $exclude: #.exclude;
    .group(<compilations>)
    .({file:value.pick(), compilation:key})
    .({
      ...$,
      packages: compilation.nodeModules.[name not in $exclude].[instances.size() > 1].({
        ...$,
        instances: instances.sort(isRoot desc, path.size() asc)
      })
      .sort(instances.size() desc, name asc)
    })
    .[packages]`,
    data.files,
    { exclude: ruleParams.exclude }
  ) as Result[];

  for (const item of duplicatePackages) {
    for (const packageItem of item.packages) {
      const versions = data.query('instances.version.[]', packageItem) as string[];
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
