import '@discoveryjs/discovery/dist/discovery.css';
import '../global.css';
// @ts-ignore
import * as discoveryLib from '@discoveryjs/discovery';
import {
  NormalizedFile,
  RawStatsFileDescriptor,
} from '@statoscope/webpack-model/dist/normalize';
import { WidgetOptions } from '@statoscope/types';
import settings from '../settings';
import { Context, InitArg, StatoscopeWidget } from '../../types';
import initMenu from './init-menu';

export default ({
  element = document.body,
  data,
  name,
  prepare,
  views,
  pages,
}: InitArg): StatoscopeWidget => {
  const discovery = new discoveryLib.App(element, {
    darkmode: 'disabled',
    setup: {},
    styles: [
      // @ts-ignore
      ...document.querySelectorAll('link[rel="stylesheet"][statoscope-style]'),
      // @ts-ignore
      ...document.querySelectorAll('style[statoscope-style]'),
    ].map((el) => {
      el.remove();

      if (el.tagName === 'LINK') {
        return { type: 'link', href: el.href };
      }

      return el.textContent;
    }),
  } as WidgetOptions) as StatoscopeWidget;

  if (data) {
    data = Array.isArray(data) ? data : [data];
  }

  const context: Context = {
    name,
    get stats(): NormalizedFile[] {
      return discovery.data;
    },
    get rawData(): RawStatsFileDescriptor[] {
      return data as RawStatsFileDescriptor[];
    },
  };

  discovery.apply(discoveryLib.router);
  discovery.setPrepare(prepare(discovery));

  const setDataPromise = discovery.setData(data, context);

  discovery.apply(views);
  discovery.apply(pages);

  settings.eventChanged.on(() => discovery.renderPage());

  initMenu(discovery);

  setDataPromise.then(() => {
    const context = discovery.getRenderContext();

    if (!context.params.hash) {
      const targetHash = discovery.data[0]?.compilations.find(
        (compilation) => !compilation.isChild
      )?.hash;
      const link = discovery.encodePageHash(context.page, context.id, {
        ...context.params,
        hash: targetHash,
      });
      location.assign(link);
    }
  });

  return discovery;
};
