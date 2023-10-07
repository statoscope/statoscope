import { StatoscopeWidget } from '../../types';
// @ts-ignore
import badgeFix from './helpers.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('custom-reports-list', (el, config, data = {}, context?) => {
    // @ts-ignore
    const { onClick } = config;

    discovery.view.render(
      el,
      [
        {
          data: `#.stats.(
            $file: $;
            compilations.(
              $compilation: $;
              $file.name.customReports_getItems($compilation.hash).({ report: $, $file })
            )
          ).group(<file>, <report>).(
            $file: key;
            $reports: value;
            $reports.({
              $report: $;
              ...$report,
              file: $file.name,
              href: $report.id.pageLink('custom-report', { file: $file.name }),
            })
          ).sort(name desc)`,
          view: 'menu',
          emptyText: `No custom reports found.`,
          onChange(el: HTMLLinkElement, data: unknown, context: unknown): void {
            if (typeof onClick === 'function') {
              onClick(el, data, context);
            }

            location.assign(el.href);
          },
          itemConfig: {
            when: `when.typeof() = 'undefined' ? true : when`,
            className: badgeFix.root,
            content: [
              {
                view: 'link',
                data: `{text: name or id, href}`,
              },
              `badge:file`,
            ],
          },
        },
      ],
      data,
      context,
    );
  });
}
