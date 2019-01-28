import './module-item.css';

export default function (discovery) {
  discovery.view.define('module-item', render);
  discovery.view.define('module-item-inline', render);

  function render(el, config, data, context) {
    const { inline } = config;

    if (inline) {
      el.classList.add('view-module-item-inline');
    }

    const { showType = true, showFileSize = false, showBundledSize = false } = data;

    discovery.view.render(el, [
      {
        view: 'badge',
        data: '{ text: module.type, color: module.type.color() }',
        when: showType
      },
      {
        view: 'badge',
        data: '{ text: module.file and module.file.size.formatSize() or module.size.formatSize() }',
        when: showFileSize && data.module.file
      },
      {
        view: 'badge',
        data: '{ text: module.file and module.file.size.formatSize() or module.size.formatSize() }',
        when: showBundledSize
      },
      {
        view: 'badge',
        when: 'module.file',
        data: '{ text: module.file.ext, color: module.file.ext.fileType().color() }'
      },
      {
        view: 'link',
        data: '{ href:"#module:" + module.id.encodeURIComponent(), text: module.file.path or module.id, match: match }',
        content: 'text-match'
      }
    ], data, context);
  }
}
