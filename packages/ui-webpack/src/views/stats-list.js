export default function (discovery) {
  discovery.view.define('stats-list', render);

  function render(el, config, data = {}, context) {
    const { onClick } = config;

    discovery.view.render(
      el,
      [
        {
          when: 'showHeader!=false',
          view: 'h2',
          data: '"Choose a stats to view:"',
        },
        {
          data: `#.data.compilations.[hash!=#.params.hash].({
            text: fileName or hash.slice(0, 7),
            href: #.id.pageLink(#.page, { ...#.params,hash }),
            version,
            name,
            hash,
            builtAt
          })`,
          view: 'menu',
          onChange(el, data, context) {
            if (typeof onClick === 'function') {
              onClick(el, data, context);
            }

            location.assign(el.href);
          },
          itemConfig: {
            content: [
              {
                view: 'link',
                data: `{text, href}`,
              },
              {
                view: 'badge',
                className: 'hack-badge-margin-left',
                data: `{prefix: 'webpack',text: version}`,
              },
              {
                view: 'badge',
                when: 'name',
                data: `{prefix: 'name',text: name}`,
              },
              {
                view: 'badge',
                when: 'fileName',
                data: `{prefix: 'hash',text: hash.slice(0, 7)}`,
              },
              {
                view: 'badge',
                data: `{prefix: 'date',text: builtAt.formatDate()}`,
              },
            ],
          },
        },
      ],
      data,
      context
    );
  }
}
