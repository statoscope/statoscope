import { StatoscopeWidget } from '../../types';
// @ts-ignore
import badgeFix from './helpers.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('stats-list', (el, config, data = {}, context?) => {
    // @ts-ignore
    const { onClick } = config;

    discovery.view.render(
      el,
      [
        {
          when: 'showHeader!=false',
          view: 'h2',
          data: '"Choose a stat to view:"',
        },
        {
          data: `#.stats.compilations.hash.(resolveStat()).[not compilation.shouldHideCompilation()].({
            text: file.name or compilation.hash.slice(0, 7),
            version: file.version,
            fileName: file.name,
            href: #.id.pageLink(#.page, { ...#.params, hash: compilation.hash }),
            selected: #.params.hash = compilation.hash,
            name: compilation.name,
            hash: compilation.hash,
            builtAt: compilation.builtAt,
            isChild: compilation.isChild
          }).sort(builtAt desc)`,
          view: 'menu',
          emptyText: `No stats found. Ensure that you're using valid webpack stats.`,
          onChange(el: HTMLLinkElement, data: unknown, context: unknown): void {
            if (typeof onClick === 'function') {
              onClick(el, data, context);
            }

            location.assign(el.href);
          },
          itemConfig: {
            className: badgeFix.root,
            content: [
              {
                view: 'link',
                data: `{text, href}`,
              },
              {
                view: 'badge',
                when: 'name',
                data: `{prefix: 'name', text: name.moduleNameResource()}`,
              },
              {
                view: 'badge',
                when: 'version',
                data: `{prefix: 'webpack', text: version}`,
              },
              {
                view: 'badge',
                when: 'hash and fileName',
                data: `{prefix: 'hash', text: hash.slice(0, 7)}`,
              },
              {
                view: 'badge',
                when: 'builtAt',
                data: `{prefix: 'date', text: builtAt.formatDate()}`,
              },
              {
                view: 'badge',
                when: 'isChild',
                data: `{text: 'child'}`,
              },
            ],
          },
        },
      ],
      data,
      context
    );
  });
}
