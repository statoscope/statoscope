import { ViewConfigData } from '@statoscope/types';
// @ts-ignore
import styles from './helpers.css';

export function statsSelect(
  value: string,
  onChange: (value: string) => void
): ViewConfigData {
  return {
    view: 'select',
    placeholder: 'choose a stat',
    value: value,
    text: `
    $stat: resolveStat();
    $stat ? ($stat.statName() + ' ' + $stat.compilation.builtAt.formatDate()) : "n/a"
    `,
    data: 'compilations.[not shouldHideCompilation()].hash',
    onChange,
  };
}

export function diffBadges(): ViewConfigData {
  return {
    view: 'inline-list',
    className: [styles['badge-container']],
    data: 'diff',
    item: {
      view: 'badge',
      data: `
      $diff: $;
      $diffValue: b - a;
      $diffPerc: b.percentFrom(a);
      $inc: $diffValue > 0;
      $prefix: $inc ? '+' : '';
      {
        prefix: title,
        text: $prefix + $diff.formatDiff(),
        postfix: a and b and $diffPerc ? $prefix + $diffPerc.toFixed() + '%' : undefined,
        color: $inc ? 0.colorFromH() : 100.colorFromH(),
      }`,
    },
  };
}
