import Chart, { ChartConfiguration } from 'chart.js/auto';
import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './chart.css';

const defaultConfig: ChartConfiguration = {
  type: 'line',
  data: {
    datasets: [],
  },
};

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'chart-chart-js',
    (el, config, data: ChartConfiguration = defaultConfig) => {
      const canvas = document.createElement('canvas');

      el.appendChild(canvas);
      el.classList.add(styles.root);
      setTimeout(
        () =>
          new Chart(canvas, {
            ...data,
            options: { ...data.options, maintainAspectRatio: false },
          }),
        100,
      );
    },
  );
}
