import packagesTree, { packageInstanceTree } from './default/packages-tree';

export default function (discovery) {
  discovery.page.define('package', [
    {
      data: '#.params.hash.resolveCompilation()',
      view: 'switch',
      content: [
        {
          when: 'not $',
          content: 'stats-list',
        },
        {
          when: '$',
          content: [
            {
              when: 'not validation.result',
              view: 'alert-danger',
              data: `validation.message`,
            },
            {
              view: 'switch',
              data: `
              $package:nodeModules.[name=#.id.decodeURIComponent()][0];
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
                      $packageModules.[not shouldHideModule()].modulesToFoamTree()
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
                      $packageModules.[not shouldHideModule()].modulesToFoamTree()
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
