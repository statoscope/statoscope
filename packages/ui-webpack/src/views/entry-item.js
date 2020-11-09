export default function (discovery) {
  discovery.view.define('entry-item', render);

  function render(el, config, data, context) {
    const { showSize = true } = data;

    discovery.view.render(
      el,
      [
        {
          view: 'link',
          data: `{
            href: entrypoint.name.pageLink("entrypoint", {hash:hash or #.params.hash}),
            text: entrypoint.name,
            match: match
          }`,
          content: 'text-match',
        },
        {
          view: 'badge',
          className: 'hack-badge-margin-left',
          data: `$hash:hash or #.params.hash;
          {
            prefix: "initial size",
            text: entrypoint.data.chunks.(resolveChunk($hash)).[initial].files.(resolveAsset($hash)).[$].size.reduce(=> $ + $$, 0).formatSize(),
            color: entrypoint.data.isOverSizeLimit and 0.colorFromH(),
            hint: entrypoint.data.isOverSizeLimit and "oversized"
          }`,
          when: showSize,
        },
      ],
      data,
      context
    );
  }
}
