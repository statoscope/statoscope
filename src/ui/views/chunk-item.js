import styles from './chunk-item.css';

export default function (discovery) {
  discovery.view.define('chunk-item', render);
  discovery.view.define('chunk-item-inline', render);

  function render(el, config, data, context) {
    const { inline } = config;

    if (inline) {
      el.classList.add(styles.inline);
    }

    const { showSize = false, showModulesAmount = false } = data;

    discovery.view.render(el, [
      {
        view: 'badge',
        data: '{ text: chunk.getTotalFilesSize().formatSize() }',
        when: showSize
      },
      {
        view: 'badge',
        data: '{ text: chunk.modules.size() }',
        when: showModulesAmount
      },
      {
        view: 'link',
        data: `{
          href:"#chunk:" + chunk.id.encodeURIComponent(),
          text: chunk.name or (chunk.id + (chunk.reason and (" [" + chunk.reason + "]") or "")),
          match: match
        }`,
        content: 'text-match'
      }
    ], data, context);
  }
}
