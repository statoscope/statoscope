import createFormTree from '../foam-tree';
import popup from '../popup';
import styles from './foam-tree.css';

let thePopup;

function getPopup(discovery, data) {
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
        ],
      },
      {
        view: 'block',
        className: 'inline-layout',
        content: [
          {
            view: 'block',
            content: 'html:"<b>size:&nbsp;</b>"',
          },
          'text:weight.formatSize()',
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

function destroyPopup() {
  if (thePopup) {
    thePopup.destroy();
    thePopup = null;
  }
}

export default function (discovery) {
  discovery.view.define('foam-tree', render);

  function render(element, config, data, context) {
    element.addEventListener('mouseleave', destroyPopup);
    element.classList.add(styles.root);

    setTimeout(() => {
      createFormTree({
        element,
        dataObject: data,
        onGroupHover(event) {
          if (event.group.attribution) {
            event.preventDefault();
            destroyPopup();
            return false;
          }

          getPopup(discovery, event.group);
        },
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
    }, 0);
  }
}
