import Highcharts, { HTMLDOMElement, Options } from 'highcharts';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './chart.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('chart', (el, config, data: Options = {}, context) => {
    // @ts-ignore
    const chartData = discovery.query(config.options ?? data, data, context) as Options;
    el.classList.add(styles.root);
    try {
      Highcharts.chart(el as HTMLDOMElement, chartData);
    } catch (e) {
      // @ts-ignore
      discovery.view.render(el, { view: 'fallback', reason: e.message }, data, context);
    }
  });
}
