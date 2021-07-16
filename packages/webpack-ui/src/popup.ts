import { createPopper, Instance } from '@popperjs/core';
import { ViewConfig } from '@statoscope/types';
import { StatoscopeWidget } from '../types';

let mouse = { clientX: 0, clientY: 0 };

const ref: Partial<Element> = {
  getBoundingClientRect: (): DOMRect => ({
    x: mouse.clientX,
    y: mouse.clientY,
    top: mouse.clientY,
    right: mouse.clientX,
    bottom: mouse.clientY,
    left: mouse.clientX,
    width: 0,
    height: 0,
    toJSON(): unknown {
      return this;
    },
  }),
  clientWidth: 0,
  clientHeight: 0,
};

export type PopupAPI<TData> = {
  create(data: TData): void;
  setData(data: TData): void;
  destroy(): void;
};

export default <TData, TContext>(
  discovery: StatoscopeWidget,
  view: ViewConfig<TData, TContext>
): PopupAPI<TData> => {
  function render(el: HTMLElement, newData: TData): void {
    if (newData !== data) {
      el.innerHTML = '';
      discovery.view.render(el, view, newData);
      data = newData;
    }
  }

  const el = document.createElement('div');
  discovery.dom.container.append(el);
  el.id = 'popupContent';
  let popper: Instance | null = null;
  let data: TData | null = null;

  return {
    create(data: TData): void {
      this.setData(data);

      popper = createPopper(ref as Element, el, {
        placement: 'auto-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [10, 10],
            },
          },
        ],
        onFirstUpdate() {
          document.onmousemove = ({ clientX, clientY }): void => {
            mouse = { clientX, clientY };
            popper?.update();
          };
        },
      });
    },
    setData(data: TData): void {
      render(el, data);
    },
    destroy(): void {
      popper?.destroy();
      el.remove();
    },
  };
};
