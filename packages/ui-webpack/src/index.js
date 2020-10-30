import '@discoveryjs/discovery/dist/discovery.css';
import './global.css';
import * as discoveryLib from '@discoveryjs/discovery/dist/discovery.umd';
import settings, {
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
} from './settings';
import prepare from './prepare';
import * as pages from './pages';
import * as views from './views';
import settingsStyles from './settings-styles.css';

export default (data, element = document.body) => {
  const discovery = new discoveryLib.App(element, {
    darkmode: 'disabled',
    setup: {},
  });

  const context = {
    name: '📦 Statoscope',
    createdAt: new Date().toISOString(),
    data,
  };

  discovery.apply(discoveryLib.router);
  discovery.setPrepare(prepare);
  discovery.setData(data, context);

  discovery.apply(views);
  discovery.apply(pages);

  settings.eventChanged.on(() => discovery.renderPage());

  discovery.nav.menu.append({
    view: 'block',
    className: settingsStyles.toggle,
    name: 'node-modules',
    postRender: (el, opts, data, { hide }) => {
      const hideNodeModules = settings.get(
        SETTING_HIDE_NODE_MODULES,
        SETTING_HIDE_NODE_MODULES_DEFAULT
      );

      render(hideNodeModules.get());

      hideNodeModules.eventChange.on((sender, { value }) => render(value));

      function render(value) {
        el.innerHTML = '';
        discovery.view.render(
          el,
          {
            view: 'toggle-group',
            beforeToggles: 'text:"Hide node_modules"',
            onChange: (value) => {
              hideNodeModules.set(value);
              hide();
            },
            value,
            data: [
              { value: false, text: 'No' },
              { value: true, text: 'Yes' },
            ],
          },
          null,
          { widget: discovery }
        );
      }
    },
  });

  discovery.nav.menu.append({
    view: 'block',
    className: settingsStyles.toggle,
    name: 'items-limit',
    postRender: (el, opts, data, { hide }) => {
      const limit = settings.get(
        SETTING_LIST_ITEMS_LIMIT,
        SETTING_LIST_ITEMS_LIMIT_DEFAULT
      );

      render(limit.get());

      limit.eventChange.on((sender, { value }) => render(value));

      function render(value) {
        el.innerHTML = '';
        discovery.view.render(
          el,
          {
            view: 'toggle-group',
            beforeToggles: 'text:"List items limit"',
            onChange: (value) => {
              limit.set(value);
              hide();
            },
            value,
            data: [
              { value: '10', text: 10 },
              { value: '20', text: 20 },
              { value: '50', text: 50 },
              { value: '100', text: 100 },
            ],
          },
          null,
          { widget: discovery }
        );
      }
    },
  });

  discovery.nav.primary.append({
    name: 'github',
    data: `{ text: "Github", href: 'https://github.com/smelukov/statoscope' }`,
  });

  discovery.nav.primary.append({
    name: 'donate',
    data: `{ text: "Donate", href: 'https://www.paypal.com/paypalme/smelukov' }`,
  });

  return discovery;
};
