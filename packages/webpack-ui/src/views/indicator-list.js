import styles from '../pages/default.css';

export default function indicatorList(data) {
  return {
    view: 'inline-list',
    data,
    item: {
      view: 'indicator',
      className: styles.indicator,
      data: `
      .({
        label: title,
        value: query.query(#.params.hash.resolveStat(), #)
      })`,
    },
  };
}
