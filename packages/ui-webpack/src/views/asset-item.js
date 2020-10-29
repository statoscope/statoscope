import styles from './chunk-item.css';

export default function (discovery) {
  discovery.view.define('asset-item', render);
  discovery.view.define('asset-item-inline', render);

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
          view: 'badge',
          when: 'asset.name.fileType()',
          data: `{
            text: asset.name.fileExt(),
            color: asset.name.fileType().color(),
            hint: asset.name.fileType()
          }`,
        },
        {
          view: 'link',
          data: `{
            href:"#asset:" + asset.name.encodeURIComponent(),
            text: asset.name,
            match: match
          }`,
          content: 'text-match',
        },
        {
          view: 'badge',
          className: 'hack-badge-margin-left',
          data: `{
            text: asset.size.formatSize(),
            color: asset.isOverSizeLimit and 0.colorFromH(),
            hint: asset.isOverSizeLimit and "oversized"
          }`,
          when: showSize,
        },
      ],
      data,
      context
    );
  }
}
