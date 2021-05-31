import style from './badge-margin-fix.css';

export default function (discovery) {
  discovery.view.define('package-item', render);

  function render(el, config, data, context) {
    const { inline = false } = data;

    el.classList.add(style.root);

    if (inline) {
      el.classList.add('inline-block');
    }

    discovery.view.render(
      el,
      [
        {
          view: 'link',
          data: `{
            text: package.name,
            href: package.name.pageLink("package", {hash:hash or #.params.hash}),
            match
          }`,
          content: 'text-match',
        },
        {
          when: 'showInstancesTotal!=false and package.instances.size() > 1',
          view: 'badge',
          data:
            "{text: \"+\" + (package.instances.size() - 1), postfix: (package.instances.size()-1).plural(['copy', 'copies'])}",
        },
      ],
      data,
      context
    );
  }
}
