export default function (discovery) {
  discovery.view.define('package-item', render);

  function render(el, config, data, context) {
    discovery.view.render(
      el,
      [
        {
          view: 'link',
          data: `{
            text: package.name,
            href: package.name.pageLink("package", {hash:hash or #.params.hash}),
            match: #.filter
          }`,
          content: 'text-match',
        },
        {
          when: 'package.instances.size() > 1',
          view: 'badge',
          className: 'hack-badge-margin-left',
          data:
            "{text: \"+\" + (package.instances.size() - 1), postfix: (package.instances.size()-1).plural(['copy', 'copies'])}",
        },
      ],
      data,
      context
    );
  }
}
