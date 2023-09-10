import { NormalizedChunk } from '@statoscope/webpack-model/types';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './helpers.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'chunk-item',
    (
      el,
      config,
      data?: {
        showSize?: boolean;
        showType?: boolean;
        inline?: boolean;
        showDownloadTime?: boolean;
        compact?: boolean;
        chunk: NormalizedChunk;
      },
      context?,
    ) => {
      const {
        showSize = true,
        showType = true,
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
            when: !compact && showSize,
          },
          {
            view: 'badge',
            data: `{
              $sizes: chunk.files.[].[not name.shouldExcludeResource()].(getAssetSize(hash or #.params.hash));
              prefix: "file",
              text: $sizes.reduce(=> size + $$, 0).formatSize(),
              hint: $sizes.[compressor].size() ? 'compressed' : 'uncompressed'
            }`,
            when: !compact && showSize,
          },
          {
            // todo: interpolate color from gray(0s) to red(1s)
            view: 'download-badge',
            data: `{
              size: chunk.files.[].[not name.shouldExcludeResource()].(getAssetSize(hash or #.params.hash))
                .reduce(=> settingAssetsInjectType() = 'sync' ? (size + $$) : (size > $$ ? size : $$), 0)
            }`,
            when: !compact && showDownloadTime,
          },
          {
            when: !compact,
            view: 'validation-messages-badge',
            data: `{
              hash: hash or #.params.hash,
              type: 'chunk',
              id: chunk.id,
            }`,
          },
        ],
        data,
        context,
      );
    },
  );
}
