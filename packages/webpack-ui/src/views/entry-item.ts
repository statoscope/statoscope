import { NormalizedEntrypointItem } from '@statoscope/webpack-model/dist/normalize';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './helpers.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'entry-item',
    (
      el,
      config,
      data?: {
        showSize?: boolean;
        inline?: boolean;
        showDownloadTime?: boolean;
        compact?: boolean;
        entrypoint: NormalizedEntrypointItem;
      },
      context?
    ) => {
      const {
        showSize = true,
        inline = false,
        showDownloadTime = true,
        compact = false,
      } = data || {};

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
            $sizes: entrypoint.data.chunks.[initial].files.[].(getAssetSize(hash or #.params.hash));
            prefix: "initial size",
            text: $sizes.reduce(=> size + $$, 0).formatSize(),
            color: entrypoint.data.isOverSizeLimit and 0.colorFromH(),
            hint: [entrypoint.data.isOverSizeLimit ? "oversized": undefined, $sizes.[compressor].size() ? 'compressed' : 'uncompressed'].[]
          }`,
            when: !compact && showSize,
          },
          {
            // todo: interpolate color from gray(0s) to red(1s)
            view: 'download-badge',
            data: `{
              $sizes: entrypoint.data.chunks.[initial].files.[].(getAssetSize(hash or #.params.hash));
              size: $sizes.reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
            }`,
            when: !compact && showDownloadTime,
          },
          {
            when: !compact,
            view: 'validation-messages-badge',
            data: `{
              hash: hash or #.params.hash,
              type: 'entry',
              id: entrypoint.name,
            }`,
          },
        ],
        data,
        context
      );
    }
  );
}
