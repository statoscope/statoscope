import '@discoveryjs/discovery/dist/discovery.css';
import './global.css';
import * as discoveryLib from '@discoveryjs/discovery';
import { validate } from 'schema-utils';
import schema from '../schema/stats.json';
import settings from './settings';
import initMenu from './init-menu';

function validateStats(stats) {
  const configuration = { name: 'Stats' };

  try {
    validate(schema, stats, configuration);
    return { result: true };
  } catch (e) {
    return { result: false, message: e.message };
  }
}

function normalizeStats(data) {
  data = data || {};

  data.entrypoints = data.entrypoints || {};
  data.chunks = data.chunks || [];
  data.assets = data.assets || [];

  data.__validation = validateStats(data);

  return data;
}

function normalizeData(data) {
  data = Array.isArray(data) ? data : [data];
  return data.reduce((all, item) => {
    const normalized = normalizeStats(item);
    if (normalized.hash) {
      all[normalized.hash] = normalized;
    }
    return all;
  }, {});
}

export default ({ element = document.body, data, name, prepare, views, pages }) => {
  const discovery = new discoveryLib.App(element, {
    darkmode: 'disabled',
    setup: {},
  });

  data = normalizeData(data);

  const context = { name, data };

  discovery.apply(discoveryLib.router);
  discovery.setPrepare(prepare);
  discovery.setData(data, context);

  discovery.apply(views);
  discovery.apply(pages);

  settings.eventChanged.on(() => discovery.renderPage());

  initMenu(discovery);

  const dataEntries = Object.entries(data);
  if (dataEntries.length === 1) {
    const context = discovery.getRenderContext();
    const link = discovery.encodePageHash(context.page, context.id, {
      ...context.params,
      hash: dataEntries[0][0],
    });
    location.assign(link);
  }

  return discovery;
};
