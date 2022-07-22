import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './chart.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('chart', (el, config, data: unknown = {}, context) => {
    el.classList.add(styles.root);
    try {
      discovery.view.render(
        el,
        // @ts-ignore
        { view: `chart-${config.engine ?? 'chart-js'}` },
        data,
        context
      );
    } catch (e) {
      // @ts-ignore
      discovery.view.render(el, { view: 'error', message: e.message }, data, context);
    }
  });
}
