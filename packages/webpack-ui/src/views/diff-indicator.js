import style from './diff-indicator.css';

export default function (discovery) {
  discovery.view.define('diff-indicator', render);

  function render(el, config, data, context) {
    const { value, inline = true } = data;

    if (inline) {
      el.classList.add('inline-block');
    }

    discovery.view.render(
      el,
      [
        {
          view: 'indicator',
          className: [
            style.root,
            value > 0 ? style.danger : value < 0 ? style.green : undefined,
          ],
          data: `
          $value: valueText or value;
          $inc: value > 0;
          {
            label,
            value: $inc ? \`+\${$value}\` : $value
          }`,
        },
      ],
      data,
      context
    );
  }
}
