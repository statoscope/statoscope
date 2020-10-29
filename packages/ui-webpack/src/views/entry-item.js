import styles from './chunk-item.css';

export default function (discovery) {
  discovery.view.define('entry-item', render);
  discovery.view.define('entry-item-inline', render);

  function render(el, config, data, context) {
    const { inline } = config;

    if (inline) {
      el.classList.add(styles.inline);
    }

    const { showSize = true } = data;

    discovery.view.render(
      el,
      [
        {
          view: 'link',
          data: `{
            href:"#entrypoint:" + entrypoint.name.encodeURIComponent(),
            text: entrypoint.name,
            match: match
          }`,
          content: 'text-match',
        },
        {
          view: 'badge',
          className: 'hack-badge-margin-left',
          data: `{
            prefix: "initial size",
            text: entrypoint.data.chunks.(resolveChunk()).[initial].files.(resolveAsset()).[$].size.reduce(=> $ + $$).formatSize(),
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
