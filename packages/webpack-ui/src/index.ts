/* global require, process */
import { RawData, StatoscopeWidget } from '../types';
import prepare from './init/prepare/';
import initApp from './init/init-app';

const V = process.env.STATOSCOPE_VERSION;
export default (data: RawData, element = document.body): StatoscopeWidget => {
  // @ts-ignore
  const viewsContext = require.context('./views', false, /\.ts$/);
  const customView = [] as const;
  // @ts-ignore
  const pagesContext = require.context('./pages', false, /\.ts$/);

  return initApp({
    element,
    data,
    pages: pagesContext.keys().map(pagesContext),
    views: [...viewsContext.keys().map(viewsContext), ...customView],
    prepare,
    name: `📦 Statoscope ${V || ''}`,
  });
};
