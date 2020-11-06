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
          data: '#.data.values().[hash!=#.params.hash].({hash,version})',
          view: 'list',
          itemConfig: {
            content: [
              {
                view: 'link',
                data: `{text:hash,href:#.id.pageLink(#.page, {...#.params,hash})}`,
                onClick(el, data, context) {
                  if (typeof onClick === 'function') {
                    onClick(el, data, context);
                  }

                  location.assign(el.href);
                },
              },
              {
                view: 'badge',
                className: 'hack-badge-margin-left',
                data: `{prefix: 'webpack',text:version}`,
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
