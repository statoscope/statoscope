import { NodeModuleInstance } from '@statoscope/webpack-model/dist/normalize';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './helpers.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'package-instance-item',
    (
      el,
      config,
      data?: { inline?: boolean; compact?: boolean; instance: NodeModuleInstance },
      context?
    ) => {
      const { inline = false } = data || {};

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
              $package: instance.path.nodeModule();
              text: instance.path,
              href: $package.name.pageLink("package", {instance: instance.path, hash:hash or #.params.hash}),
              match
            }`,
            content: 'text-match',
          },
          {
            view: 'badge',
            className: 'hack-badge-margin-left',
            when: `
            $package: instance.path.nodeModule();
            $package.name.getPackageInstanceInfo(instance.path, hash or #.params.hash)
            `,
            data: `{
              $package: instance.path.nodeModule();
              text: $package.name.getPackageInstanceInfo(instance.path, hash or #.params.hash).info.version
            }`,
          },
          {
            when: `not compact`,
            view: 'validation-messages-badge',
            data: `{
              hash: hash or #.params.hash,
              type: 'package-instance',
              id: instance.path,
            }`,
          },
        ],
        data,
        context
      );
    }
  );
}
