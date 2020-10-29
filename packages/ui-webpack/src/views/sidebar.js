export default function (discovery) {
  discovery.view.define(
    'sidebar',
    {
      view: 'tabs',
      name: 'messagesTabs',
      tabs: [
        { value: 'files', text: 'Files' },
        { value: 'node_modules', text: 'Node Modules' },
      ],
      content: {
        view: 'content-filter',
        content: {
          view: 'switch',
          content: [
            {
              when: '#.messagesTabs="files"',
              content: {
                view: 'list',
                data: `
                      data.input.files.sort(<path>).[no #.filter or path~=#.filter]
                      .({
                          caption: path,
                          href: "#file:" + path.encodeURIComponent(),
                          match: #.filter
                      })
                    `,
                emptyText: 'No matches',
                item: 'toc-item',
              },
            },
            {
              when: '#.messagesTabs="node_modules"',
              content: {
                view: 'list',
                data: `
                      data.input.files.nodeModule.name.sort().[no #.filter or $~=#.filter]
                      .({
                          caption: $,
                          href: "#node-module:" + $.encodeURIComponent(),
                          match: #.filter
                      })
                    `,
                emptyText: 'No matches',
                item: 'toc-item',
              },
            },
          ],
        },
      },
    },
    {
      tag: false,
    }
  );
}
