// @ts-ignore
import styles from './index2.css';

import 'extLib';

// @ts-ignore
import txt from './test.txt';

import('./dyn').then((Module) => {
  console.log(Module.default);
});

console.log(txt, styles.root);
