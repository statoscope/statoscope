import styles from './module-item.css';

export default function (discovery) {
  discovery.view.define('module-item', render);
  discovery.view.define('module-item-inline', render);

  function render(el, config, data, context) {
    const { inline } = config;

    if (inline) {
      el.classList.add(styles.inline);
    }

    const { showType = true, showFileSize = false, showBundledSize = false } = data;

    discovery.view.render(el, [
      {
        view: 'badge',
        data: '{ text: module.type, color: module.type.color() }',
        when: showType && data.module.type != 'MultiModule'
      },
      {
        view: 'badge',
        data: '{ text: module.file and module.file.size.formatSize() or module.size.formatSize() }',
        when: showFileSize && data.module.file
      },
      {
        view: 'badge',
        data: '{ text: module.size.formatSize() }',
        when: showBundledSize && data.module.type != 'MultiModule'
      },
      {
        view: 'badge',
        when: 'module.file',
        data: '{ text: module.file.ext, color: module.file.ext.fileType().color() }'
      },
      {
        view: 'link',
        when: 'module.type != "MultiModule"',
        data: '{ href:"#module:" + module.id.encodeURIComponent(), text: module.file.path or module.id, match: match }',
        content: 'text-match'
      },
      {
        view: 'expand',
        className: styles.expand,
        when: 'module.type = "MultiModule"',
        title: 'text: "Multi-module with " + module.deps.size() + " dependencies"',
        content: [
          {
            view: 'link',
            data: '{ href:"#module:" + module.id.encodeURIComponent(), text: "View details" }',
            content: 'text-match'
          },
          {
            view: 'list',
            limit: 5,
            data: 'module.deps.module',
            item: {
              view: 'module-item',
              data: `{
                module: $, 
                showType: false, 
                showFileSize: true,
                match: #.filter
              }`
            }
          }
        ]
      }
    ], data, context);
  }
}
