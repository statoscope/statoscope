// @ts-ignore
import styles from './index2.css';

import 'extLib';

const txt = new URL('./test.txt', import.meta.url);

import('./dyn').then((Module) => {
  console.log(Module.default);
});

console.log(txt, styles.root);
