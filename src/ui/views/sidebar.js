export default function (discovery) {
  discovery.view.define('sidebar', {
    view: 'content-filter',
    content: {
      view: 'list',
      data: `
        data.input.files.[no #.filter or path~=#.filter]
        .({
            caption: path,
            href: "#file:" + path.encodeURIComponent(),
            match: #.filter
        })
      `,
      emptyText: 'No matches',
      item: 'toc-item'
    }
  }, {
    tag: false
  });
}
