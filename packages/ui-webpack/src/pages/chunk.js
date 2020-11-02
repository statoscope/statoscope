import chunksTree from './default/chunks-tree';

export default function (discovery) {
  discovery.page.define('chunk', [
    {
      when: 'not __validation.result',
      view: 'alert-danger',
      data: `__validation.message`,
    },
    {
      view: 'switch',
      data: `#.data.chunks.[(''+id)=#.id.decodeURIComponent()][0]`,
      content: [
        {
          when: 'not $',
          content: 'alert-warning:"Chunk `" + #.id.decodeURIComponent() + "` not found"',
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
  ]);
}
