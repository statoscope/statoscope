import createFormTree from '../foam-tree';
import popup from '../popup';
import styles from './foam-tree.css';

let thePopup;

function getPopup(discovery, data) {
  if (!thePopup) {
    thePopup = popup(discovery, [
      { view: 'block', content: 'text:label' },
      { view: 'block', content: 'text:"Size: " + weight.formatSize()' },
      { view: 'block', content: 'text:"Path: " + path' },
    ]);
    thePopup.create(data);
  } else {
    thePopup.setData(data);
  }

  return thePopup;
}

export default function (discovery) {
  discovery.view.define('foam-tree', render);

  function render(element, config, data, context) {
    element.addEventListener('mouseleave', () => {
      thePopup.destroy();
      thePopup = null;
    });
    element.classList.add(styles.root);

    setTimeout(() => {
      createFormTree({
        element,
        dataObject: data,
        onGroupHover(event) {
          getPopup(discovery, event.group);
        },
        onGroupSecondaryClick(group) {},
      });
    }, 0);
  }
}
