import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './diff.css';
import { statsSelect } from './diff/helpers';
import modulesDupsTab from './diff/modulesDupsTab';
import assetsTab from './diff/assetsTab';
import packagesTab from './diff/packagesTab';
import entriesTab from './diff/entriesTab';
import chunksTab from './diff/chunksTab';
import modulesTab from './diff/modulesTab';
import assetsQuery from './diff/queries/assets';
import chunksQuery from './diff/queries/chunks';
// import dupModulesQuery from './diff/queries/dupModules';
import entriesQuery from './diff/queries/entries';
import headerQuery from './diff/queries/header';
import modulesQuery from './diff/queries/modules';
import packagesQuery from './diff/queries/packages';
import dashboard from './diff/queries/dashboard';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('diff', [
    {
      view: 'page-header',
      content: 'h1:"Stats diff"',
      prelude: [
        {
          view: 'block',
          className: styles.root,
          content: [
            {
              view: 'block',
              content: [
                { view: 'block', content: ['text: "Before:"'] },
                statsSelect('#.params.hash', (value: string): void => {
                  const context = discovery.getRenderContext();
                  const link = discovery.encodePageHash(context.page, context.id, {
                    ...context.params,
                    hash: value,
                  });
                  location.assign(link);
                }),
              ],
            },
            {
              view: 'link',
              className: styles.with,
              onClick(): void {
                const context = discovery.getRenderContext();
                const link = discovery.encodePageHash(context.page, context.id, {
                  ...context.params,
                  hash: context.params.diffWith,
                  diffWith: context.params.hash,
                });

                if (link) {
                  location.assign(link);
                }
              },
              data: `{text: '🔄', href: '#'}`,
            },
            {
              view: 'block',
              content: [
                { view: 'block', content: ['text: "After:"'] },
                statsSelect('#.params.diffWith', (value) => {
                  const context = discovery.getRenderContext();
                  const link = discovery.encodePageHash(context.page, context.id, {
                    ...context.params,
                    diffWith: value,
                  });
                  location.assign(link);
                }),
              ],
            },
          ],
        },
      ],
    },
    {
      when: `
      $statA: #.params.hash.resolveStat();
      $statB: #.params.diffWith.resolveStat();
      not ($statA and $statB)
      `,
      view: 'alert-warning',
      data: '"Choose two stats to compare"',
    },
    {
      when: `
      $statA: #.params.hash.resolveStat();
      $statB: #.params.diffWith.resolveStat();
      $statA and $statB
      `,
      view: 'block',
      data: dashboard,
      content: [
        {
          when: `not .[visible]`,
          view: 'alert-success',
          data: '"The stats has no diff"',
        },
        {
          when: `.[visible]`,
          view: 'context',
          modifiers: {
            view: 'toggle-group',
            name: 'toggleShowValue',
            data: [
              {
                value: 'percent',
                text: '%',
              },
              {
                value: 'value',
                text: 'V',
              },
            ],
          },
          content: {
            view: 'block',
            className: styles['indicators-block'],
            content: {
              view: 'inline-list',
              item: {
                when: 'value',
                view: 'diff-indicator',
                data: `{label, value, valueText: #.toggleShowValue='value' ? valueText : valueTextP}`,
              },
            },
          },
        },
        {
          view: 'alert-warning',
          when: `settingShowCompressed()`,
          content:
            'md:"Note that delta may have changed depending on the `Show compressed size`-option"',
        },
        {
          view: 'alert-warning',
          when: `
          $statA: #.params.hash.resolveStat();
          $statB: #.params.diffWith.resolveStat();
          $statsACompressed: $statA.file.__statoscope.extensions.payload.compilations.resources.size.[compressor].size();
          $statsBCompressed: $statB.file.__statoscope.extensions.payload.compilations.resources.size.[compressor].size();
          settingShowCompressed() and ($statsACompressed and not $statsBCompressed or not $statsACompressed and $statsBCompressed)
          `,
          content:
            'md:"Some stats does not contain information about compressed resource sizes.\\n\\nCompressed size of the resources will be ignored"',
        },
        {
          when: `.[visible]`,
          data: `
          ${headerQuery}
          ${modulesQuery}
          //\${dupModulesQuery}
          ${chunksQuery}
          ${assetsQuery}
          ${entriesQuery}
          ${packagesQuery}
          {
            entries: $entryDiff,
            assets: $assetsDiff,
            chunks: $chunksDiff,
            modules: $modulesDiff,
            //modulesDups: $dupModulesDiff,
            packages: $packagesDiff
          }
          `,
          view: 'tabs',
          name: 'diffTabs',
          tabs: [
            {
              value: 'assets',
              when: 'assets.added or assets.changed or assets.removed',
              text: 'Assets',
            },
            {
              value: 'chunks',
              when: 'chunks.added or chunks.changed or chunks.removed',
              text: 'Chunks',
            },
            {
              value: 'modules',
              when: 'modules.added or modules.changed or modules.removed',
              text: 'Modules',
            },
            {
              value: 'packages',
              when: 'packages.added or packages.changed or packages.removed',
              text: 'Packages',
            },
            /* {
              value: 'modulesDups',
              when: 'modulesDups.added or modulesDups.removed',
              text: 'Duplicate modules',
            }, */
            {
              value: 'entrypoints',
              when: 'entries.added or entries.changed or entries.removed',
              text: 'Entrypoints',
            },
          ],
          content: {
            view: 'content-filter',
            content: {
              view: 'switch',
              content: [
                {
                  when: '#.diffTabs="entrypoints"',
                  content: entriesTab(),
                },
                {
                  when: '#.diffTabs="chunks"',
                  content: chunksTab(),
                },
                {
                  when: '#.diffTabs="assets"',
                  content: assetsTab(),
                },
                {
                  when: '#.diffTabs="modules"',
                  content: modulesTab(),
                },
                {
                  when: '#.diffTabs="modulesDups"',
                  content: modulesDupsTab(),
                },
                {
                  when: '#.diffTabs="packages"',
                  content: packagesTab(),
                },
              ],
            },
          },
        },
      ],
    },
  ]);
}
