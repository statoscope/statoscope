import packagesTree, { packageInstanceTree } from './default/packages-tree';

export default function (discovery) {
  discovery.page.define('package', (el, data, content) => {
    // el.classList.add(styles.root);
    discovery.view.render(
      el,
      [
        {
          view: 'switch',
          data: `
          $package:#.data.nodeModules.[name=#.id.decodeURIComponent()][0];
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
              content: 'alert-warning:"Instance `" + #.params.instance + "` not found"',
            },
            {
              when: 'instance=false',
              content: [
                {
                  view: 'h1',
                  //className: styles.header,
                  content: [
                    'text:"Package"',
                    {
                      view: 'badge',
                      className: 'hack-badge-margin-left',
                      data: '{ text: package.name }',
                    },
                  ],
                },
                {
                  data: 'package',
                  ...packagesTree(),
                },
                {
                  view: 'foam-tree',
                  data: `
                  $packageModules:package.instances.modules.identifier.(resolveModule());
                  $packageModules.[not shouldHideModule()].modulesToFoamTree()
                  `,
                },
              ],
            },
            {
              when: 'instance!=false',
              content: [
                {
                  view: 'h1',
                  //className: styles.header,
                  content: [
                    'text:"Instance"',
                    {
                      view: 'badge',
                      className: 'hack-badge-margin-left',
                      data: '{ text: instance.path, prefix: package.name }',
                    },
                  ],
                },
                {
                  ...packageInstanceTree(),
                },
                {
                  view: 'foam-tree',
                  data: `
                  $packageModules:instance.modules.identifier.(resolveModule());
                  $packageModules.[not shouldHideModule()].modulesToFoamTree()
                  `,
                },
              ],
            },
          ],
        },
      ],
      data,
      content
    );
  });
}
