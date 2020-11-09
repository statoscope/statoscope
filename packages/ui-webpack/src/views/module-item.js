export default function (discovery) {
  discovery.view.define('module-item', render);

  function render(el, config, data, context) {
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
          data: `{
            href: (module.id or module.identifier).pageLink("module", {hash:hash or #.params.hash}),
            text: module.moduleResource() or module.name or module.id,
            match: match
          }`,
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
