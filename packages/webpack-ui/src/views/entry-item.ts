import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './badge-margin-fix.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'entry-item',
    (el, config, data?: { showSize?: boolean; inline?: boolean }, context?) => {
      const { showSize = true, inline = false } = data || {};

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
            href: entrypoint.name.pageLink("entrypoint", {hash:hash or #.params.hash}),
            text: entrypoint.name,
            match: match
          }`,
            content: 'text-match',
          },
          {
            view: 'badge',
            data: `$hash:hash or #.params.hash;
          {
            prefix: "initial size",
            text: entrypoint.data.chunks.[initial].files.[].size.reduce(=> $ + $$, 0).formatSize(),
            color: entrypoint.data.isOverSizeLimit and 0.colorFromH(),
            hint: entrypoint.data.isOverSizeLimit and "oversized"
          }`,
            when: showSize,
          },
        ],
        data,
        context
      );
    }
  );
}
