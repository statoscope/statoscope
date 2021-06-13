import { NormalizedModule } from '@statoscope/webpack-model/dist/normalize';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import style from './badge-margin-fix.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'module-item',
    (
      el,
      config,
      data?: { showSize?: boolean; inline?: boolean; module: NormalizedModule },
      context?
    ) => {
      const { showSize = true, inline = false } = data || {};

      el.classList.add(style.root);

      if (inline) {
        el.classList.add('inline-block');
      }

      discovery.view.render(
        el,
        [
          {
            view: 'badge',
            when: 'module.resolvedResource.fileType()',
            data: `
          $moduleResource:module.resolvedResource;
          {
            text: $moduleResource.fileExt(),
            color: $moduleResource.fileType().color(),
            hint: $moduleResource.fileType()
          }`,
          },
          {
            view: 'link',
            data: `{
            href: (module.id or module.name).pageLink("module", {hash:hash or #.params.hash}),
            text: module.resolvedResource or module.name or module.id,
            match: match
          }`,
            content: 'text-match',
          },
          {
            view: 'badge',
            data: `{
              $size: module.getModuleSize(hash or #.params.hash);
              text: $size.size.formatSize(),
              hint: $size.compressor or 'uncompressed'
            }`,
            when: showSize,
          },
          {
            view: 'badge',
            data: `{
            text: "+" + module.modules.size().pluralWithValue(['module', 'modules']),
            color: 40.colorFromH()
          }`,
            when: 'module.modules',
          },
          {
            view: 'badge',
            when: 'module.optimizationBailout',
            data: `{
            text: module.optimizationBailout.size().pluralWithValue(['deopt', 'deopts']),
            color: 0.colorFromH(),
            hint: module.optimizationBailout
          }`,
          },
          {
            view: 'badge',
            when: `module.moduleType~=/^asset\\/?/`,
            data: `{
            text: 'asset module',
            color: 40.colorFromH(),
            hint: module.moduleType
          }`,
          },
        ],
        data,
        context
      );
    }
  );
}
