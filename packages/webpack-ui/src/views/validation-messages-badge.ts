import { RelatedItem } from '@statoscope/types/types/validation/test-entry';
import type { Item } from '@statoscope/stats-extension-stats-validation-result/dist/generator';
import { StatoscopeWidget } from '../../types';

export type Data = {
  showRelated?: boolean;
  related?: RelatedItem;
  messages?: Item[];
};

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'validation-messages-badge',
    (el, config, data?: Data, context?) => {
      el.classList.add('inline-block');
      discovery.view.render(
        el,
        {
          when: `(hash or #.params.hash).validation_getItems(type, id)`,
          data: `
            (hash or #.params.hash).validation_getItems(type, id)
              .size()
              .pluralWithValue(['validation message', 'validation messages'])
          `,
          view: (el: HTMLElement, config: unknown, data: string): void => {
            el.style.display = 'inline-block';
            el.textContent = '⚠️';
            el.title = data;
          },
        },
        data,
        context
      );
    }
  );
}
