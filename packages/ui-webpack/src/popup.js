import { createPopper } from '@popperjs/core';

let mouse = { pageX: 0, pageY: 0 };

const ref = {
  getBoundingClientRect: () => ({
    top: mouse.pageY,
    right: mouse.pageX,
    bottom: mouse.pageY,
    left: mouse.pageX,
    width: 0,
    height: 0,
  }),
  clientWidth: 0,
  clientHeight: 0,
};

export default (discovery, view) => {
  function render(el, newData) {
    if (newData !== data) {
      el.innerHTML = '';
      discovery.view.render(el, view, newData);
      data = newData;
    }
  }

  const el = document.createElement('div');
  document.body.append(el);
  el.id = 'popupContent';
  let popper;
  let data;

  return {
    create(data) {
      this.setData(data);
      popper = new createPopper(ref, el, {
        placement: 'auto-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [10, 10],
            },
          },
        ],
        onFirstUpdate({ instance }) {
          document.onmousemove = ({ pageX, pageY }) => {
            mouse = { pageX, pageY };
            popper.update();
          };
        },
      });
    },
    setData(data) {
      render(el, data);
    },
    destroy() {
      popper.destroy();
      el.parentNode.removeChild(el);
    },
  };
};
