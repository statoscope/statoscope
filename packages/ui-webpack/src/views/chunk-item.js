export default function (discovery) {
  discovery.view.define('chunk-item', render);

  function render(el, config, data, context) {
    const { showSize = true, showType = true } = data;

    discovery.view.render(
      el,
      [
        {
          view: 'badge',
          data: `{
            text: chunk.initial and "initial" or "async",
            color: (chunk.initial and "initial" or "async").color()
          }`,
          when: showType,
        },
        {
          view: 'link',
          data: `{
            href:chunk.id.pageLink("chunk", {hash:#.params.hash}),
            text: chunk.chunkName(),
            match: match
          }`,
          content: 'text-match',
        },
        {
          view: 'badge',
          className: 'hack-badge-margin-left',
          data: '{ text: chunk.size.formatSize() }',
          when: showSize,
        },
      ],
      data,
      context
    );
  }
}
