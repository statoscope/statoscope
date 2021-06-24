import { NormalizedAsset } from '@statoscope/webpack-model/dist/normalize';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './badge-margin-fix.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'asset-item',
    (
      el,
      config,
      data?: {
        showSize?: boolean;
        inline?: boolean;
        showDownloadTime?: boolean;
        compact?: boolean;
        asset: NormalizedAsset;
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
            view: 'badge',
            when: 'asset.name.fileType()',
            data: `{
            text: asset.name.fileExt(),
            color: asset.name.fileType().color(),
            hint: asset.name.fileType()
          }`,
          },
          {
            view: 'link',
            data: `{
            href:asset.name.pageLink("asset", {hash:hash or #.params.hash}),
            text: asset.name,
            match: match
          }`,
            content: 'text-match',
          },
          {
            view: 'badge',
            data: `{
            $size: asset.getAssetSize(hash or #.params.hash);
            text: $size.size.formatSize(),
            color: asset.isOverSizeLimit and 0.colorFromH(),
            hint: [asset.isOverSizeLimit ? "oversized": undefined, $size.compressor or 'uncompressed'].[]
          }`,
            when: !compact && showSize,
          },
          {
            // todo: interpolate color from gray(0s) to red(1s)
            view: 'download-badge',
            data: `{ size: asset.getAssetSize(hash or #.params.hash).size }`,
            when: !compact && showDownloadTime,
          },
        ],
        data,
        context
      );
    }
  );
}
