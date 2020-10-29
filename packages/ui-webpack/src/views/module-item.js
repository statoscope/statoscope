import styles from './module-item.css';

export default function (discovery) {
  discovery.view.define('module-item', render);
  discovery.view.define('module-item-inline', render);

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
          when: 'module.moduleResource().fileType()',
          data: `
          $moduleResource:module.moduleResource();
          {
            text: $moduleResource.fileExt(),
            color: $moduleResource.fileType().color(),
            hint: $moduleResource.fileType()
          }`,
        },
        {
          view: 'link',
          data:
            '{ href:"#module:" + (module.id or module.identifier).encodeURIComponent(), text: module.moduleResource() or module.name or module.id, match: match }',
          content: 'text-match',
        },
        {
          view: 'badge',
          className: 'hack-badge-margin-left',
          data: `{text: module.moduleSize().formatSize()}`,
          when: showSize && data.module.size,
        },
        {
          view: 'badge',
          className: 'hack-badge-margin-left',
          data: `{
            text: "+" + module.modules.size().pluralWithValue(['module', 'modules']),
            color: 40.colorFromH()
          }`,
          when: 'module.modules',
        },
        {
          view: 'badge',
          className: 'hack-badge-margin-left',
          data: `{
            text: "deopt",
            color: 0.colorFromH(),
            hint: module.optimizationBailout
          }`,
          when: 'module.optimizationBailout',
        },
      ],
      data,
      context
    );
  }
}
