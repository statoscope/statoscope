import { StatoscopeWidget } from '../../types';
import packagesTree, { packageInstanceTree } from './default/packages-tree';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('package', [
    {
      data: '#.params.hash.resolveStat()',
      view: 'switch',
      content: [
        {
          when: 'not compilation',
          content: 'stats-list',
        },
        {
          when: 'compilation',
          content: [
            {
              view: 'switch',
              data: `
              $package:compilation.nodeModules.[name=#.id.decodeURIComponent()][0];
              {
                package: $package,
                instance: #.params.instance ? $package.instances.[path=#.params.instance][0] : false
              }`,
              content: [
                {
                  when: 'not package',
                  content:
                    'alert-warning:"Package `" + #.id.decodeURIComponent() + "` not found"',
                },
                {
                  when: 'instance=undefined',
                  content:
                    'alert-warning:"Instance `" + #.params.instance + "` not found"',
                },
                {
                  when: 'instance=false',
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Package" }',
                      content: 'h1:package.name',
                    },
                    {
                      data: 'package',
                      ...packagesTree(),
                    },
                    {
                      view: 'foam-tree',
                      data: `
                      $packageModules:package.instances.modules;
                      $packageModules.[not shouldHideModule()].modulesToFoamTree(#.params.hash)
                      `,
                    },
                  ],
                },
                {
                  when: 'instance!=false',
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Instance of", postfix: package.name }',
                      content: 'h1:instance.path',
                    },
                    {
                      ...packageInstanceTree(),
                    },
                    {
                      view: 'foam-tree',
                      data: `
                      $packageModules:instance.modules;
                      $packageModules.[not shouldHideModule()].modulesToFoamTree(#.params.hash)
                      `,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
}
