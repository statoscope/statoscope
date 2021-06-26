// @ts-ignore
import createFormTree from '../foam-tree';
import popup, { PopupAPI } from '../popup';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './foam-tree.css';

let thePopup: PopupAPI<unknown> | null = null;

function getPopup<TData>(discovery: StatoscopeWidget, data: TData): PopupAPI<TData> {
  if (!thePopup) {
    thePopup = popup(discovery, [
      {
        view: 'block',
        className: 'inline-layout',
        content: [
          {
            view: 'block',
            content: 'html:"<b>"+(link.page or "directory") + ":&nbsp;</b>"',
          },
          `text:link.page = 'package' ? link.id : label`,
          {
            view: 'badge',
            className: 'hack-badge-margin-left',
            when: `
            $package: link.package;
            $instance: $package.name.getInstanceInfo($package.instance.path, "${
              discovery.getRenderContext().params.hash
            }");
            link.page = 'package' and $instance.info.version
            `,
            data: `{
              $package: link.package;
              $instance: $package.name.getInstanceInfo($package.instance.path, "${
                discovery.getRenderContext().params.hash
              }");
              text: $instance.info.version
            }`,
          },
        ],
      },
      {
        view: 'block',
        className: 'inline-layout',
        content: [
          {
            view: 'block',
            content: 'html:`<b>size:&nbsp;</b>`',
          },
          'text:weight.formatSize()',
          // eslint-disable-next-line no-template-curly-in-string
          'text:weightCompressor ? ` [${weightCompressor}]` : ""',
        ],
      },
      {
        view: 'block',
        className: 'inline-layout',
        content: [
          {
            view: 'block',
            content: 'html:"<b>path:&nbsp;</b>"',
          },
          'text:path',
        ],
      },
      {
        view: 'block',
        when: 'link',
        content: 'badge:{text:"ctrl + click", postfix:"for details"}',
      },
    ]);
    thePopup.create(data);
  } else {
    thePopup.setData(data);
  }

  return thePopup;
}

function destroyPopup(): void {
  if (thePopup) {
    thePopup.destroy();
    thePopup = null;
  }
}

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('foam-tree', (element, config, data?) => {
    element.addEventListener('mouseleave', destroyPopup);
    element.classList.add(styles.root);

    (async function tryToCreate(): Promise<void> {
      try {
        createFormTree({
          element,
          dataObject: data,
          // @ts-ignore
          onGroupHover(event) {
            if (event.group.attribution) {
              event.preventDefault();
              destroyPopup();
              return false;
            }

            getPopup(discovery, event.group);
          },
          // @ts-ignore
          onGroupSecondaryClick(event) {
            const group = event.group;

            if (event.group.link) {
              const link = discovery.encodePageHash(group.link.page, group.link.id, {
                ...group.link.params,
                hash: discovery.getRenderContext().params.hash,
              });

              if (link) {
                destroyPopup();
                location.assign(link);
              }
            }
          },
        });
      } catch (e) {
        setTimeout(tryToCreate, 100);
      }
    })();
  });
}
