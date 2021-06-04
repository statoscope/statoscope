import { StatoscopeWidget } from '../../types';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('validation-errors', (el, config, data, context) => {
    discovery.view.render(
      el,
      [
        {
          data: 'validation',
          when: 'validation.result!=true',
          view: 'alert-danger',
          content: [
            'h3: "Stats is invalid"',
            {
              data: 'errors',
              view: 'ol',
              // eslint-disable-next-line no-template-curly-in-string
              item: ['md:`${instancePath or schemaPath}: ${message}`'],
            },
          ],
        },
      ],
      data,
      context
    );
  });
}
