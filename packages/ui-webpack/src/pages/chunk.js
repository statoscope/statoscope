import chunksTree from './default/chunks-tree';

export default function (discovery) {
  discovery.page.define('chunk', (el, data, content) => {
    // el.classList.add(styles.root);
    discovery.view.render(
      el,
      [
        {
          view: 'switch',
          data: `#.data.chunks.[(''+id)=#.id.decodeURIComponent()][0]`,
          content: [
            {
              when: 'not $',
              content:
                'alert-warning:"Chunk `" + #.id.decodeURIComponent() + "` not found"',
            },
            {
              content: [
                {
                  view: 'h1',
                  //className: styles.header,
                  content: [
                    'text:"Chunk"',
                    {
                      view: 'badge',
                      className: 'hack-badge-margin-left',
                      data: '{ text: chunkName() }',
                    },
                  ],
                },
                {
                  ...chunksTree(),
                },
                {
                  view: 'foam-tree',
                  data: `
                  $chunkModules:modules.identifier.(resolveModule()).[not shouldHideModule()];
                  $chunkModules.modulesToFoamTree()
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
