import settingsStyles from '../settings-styles.css';
import settings, {
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
} from '../settings';

export default (discovery) => {
  hideUseless(discovery);
  addCustomIndex(discovery);
  addStatsList(discovery);
  addSettings(discovery);
  addLinks(discovery);
};

function hideUseless(discovery) {
  discovery.nav.remove('index-page');
  if (!document.cookie.includes('debug=true')) {
    discovery.nav.remove('inspect');
  }
}

function addCustomIndex(discovery) {
  discovery.nav.prepend({
    name: 'index-page2',
    when: '#.widget | pageId != defaultPageId',
    data:
      '{ text: "Index", href: pageLink(#.widget.defaultPageId, {hash:#.params.hash}) }',
  });
}

function addLinks(discovery) {
  discovery.nav.append({
    name: 'diff',
    when: `#.widget | pageId != 'diff' and #.data.compilations.size()>1`,
    data: `{ text: "Diff", href: pageLink('diff', {hash:#.params.hash}) }`,
  });

  discovery.nav.primary.append({
    name: 'github',
    data: `{ text: "Github", href: 'https://github.com/smelukov/statoscope' }`,
  });

  discovery.nav.primary.append({
    name: 'donate',
    data: `{ text: "Donate", href: 'https://opencollective.com/statoscope' }`,
  });
}

function addStatsList(discovery) {
  const popup = new discovery.view.Popup({});
  discovery.nav.append({
    name: 'stats-list',
    when: `#.widget and #.data.compilations.size()>1`,
    content: 'html:"Choose stats &#9660"',
    onClick: (el) => {
      popup.toggle(el, (popupEl) =>
        discovery.view.render(
          popupEl,
          [
            {
              view: 'stats-list',
              data: { showHeader: false },
              onClick() {
                popup.hide();
              },
            },
          ],
          discovery.data,
          {
            ...discovery.getRenderContext(),
            widget: discovery,
            hide: () => popup.hide(),
          }
        )
      );
    },
  });
}

function addSettings(discovery) {
  discovery.nav.menu.append({
    view: 'block',
    className: [settingsStyles.item, settingsStyles.toggle],
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
    className: [settingsStyles.item, settingsStyles.toggle],
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
}
