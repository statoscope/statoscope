/* global require, process */
import prepare from './init/prepare/';
import initApp from './init/init-app';

const V = process.env.STATOSCOPE_VERSION;
export default (data, element = document.body) => {
  const viewsContext = require.context('./views', false, /\.js$/);
  const pagesContext = require.context('./pages', false, /\.js$/);

  return initApp({
    data,
    pages: pagesContext.keys().map(pagesContext),
    views: viewsContext.keys().map(viewsContext),
    prepare,
    name: `📦 Statoscope ${V || ''}`,
  });
};
