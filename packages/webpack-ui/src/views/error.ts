import { StatoscopeWidget } from '../../types';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('error', (el, config, data, context) => {
    discovery.view.render(
      el,
      [
        {
          when: 'message',
          view: 'alert-danger',
          content: ['h3:"Error"', 'text:message', 'struct'],
        },
      ],
      data,
      context,
    );
  });
}
