import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './badge-margin-fix.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'chunk-item',
    (
      el,
      config,
      data?: { showSize?: boolean; showType?: boolean; inline?: boolean },
      context?
    ) => {
      const { showSize = true, showType = true, inline = false } = data || {};

      el.classList.add(style.root);

      if (inline) {
        el.classList.add('inline-block');
      }

      discovery.view.render(
        el,
        [
          {
            view: 'badge',
            data: `{
            text: chunk.initial and "initial" or "async",
            color: (chunk.initial and "initial" or "async").color()
          }`,
            when: showType,
          },
          {
            view: 'link',
            data: `{
            href:chunk.id.pageLink("chunk", {hash:hash or #.params.hash}),
            text: chunk.chunkName(),
            match: match
          }`,
            content: 'text-match',
          },
          {
            view: 'badge',
            data: '{ prefix: "parsed", text: chunk.size.formatSize() }',
            when: showSize,
          },
          {
            view: 'badge',
            data: `{
              $sizes: chunk.files.[].(getAssetSize(hash or #.params.hash));
              prefix: "file",
              text: $sizes.size.reduce(=> $ + $$, 0).formatSize(),
              hint: $sizes.[compressor].size() ? 'compressed' : 'uncompressed'
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
