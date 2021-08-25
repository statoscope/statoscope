import { StatoscopeWidget } from '../../types';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'download-badge',
    (el, config, data?: { size: number; inline: boolean }, context?) => {
      const { size = NaN, inline = true } = data || {};

      if (Number.isNaN(size)) {
        throw new Error('[download-badge] size must be specified');
      }

      if (inline) {
        el.classList.add('inline-block');
      }

      discovery.view.render(
        el,
        [
          {
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
