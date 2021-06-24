import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './badge-margin-fix.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'download-badge',
    (el, config, data?: { size: number; inline: boolean }, context?) => {
      const { size = NaN, inline = true } = data || {};

      if (Number.isNaN(size)) {
        throw new Error('[download-badge] size must be specified');
      }

      el.classList.add(style.root);

      if (inline) {
        el.classList.add('inline-block');
      }

      discovery.view.render(
        el,
        [
          {
            // todo: interpolate color from gray(0s) to red(1s)
            view: 'badge',
            data: `{
            $downloadTime: size.getDownloadTime();
            prefix: "download",
            text: $downloadTime.formatDuration(),
            hint: settingNetworkType().getNetworkTypeInfo().getNetworkTypeName()
          }`,
          },
        ],
        data,
        context
      );
    }
  );
}
