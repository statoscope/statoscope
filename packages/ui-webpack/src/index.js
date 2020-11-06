import prepare from './prepare';
import * as pages from './pages';
import * as views from './views';
import initApp from './init-app';

export default (data, element = document.body) => {
  return initApp({
    data,
    pages,
    views,
    prepare,
    name: '📦 Statoscope',
  });
};
