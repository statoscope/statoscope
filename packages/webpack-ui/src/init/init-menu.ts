// @ts-ignore
import settingsStyles from '../settings-styles.css';
import settings, {
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_HIDE_CHILD_COMPILATIONS,
  SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
} from '../settings';
import { StatoscopeWidget, ViewConfigData } from '../../types';

export default (discovery: StatoscopeWidget): void => {
  hideUseless(discovery);
  addCustomIndex(discovery);
  addStatsList(discovery);
  addSettings(discovery);
  addLinks(discovery);
};

function hideUseless(discovery: StatoscopeWidget): void {
  discovery.nav.remove('index-page');
  if (!document.cookie.includes('debug=true')) {
    discovery.nav.remove('inspect');
  }
}

function addCustomIndex(discovery: StatoscopeWidget): void {
  discovery.nav.prepend({
    name: 'index-page2',
    when: '#.widget | pageId != defaultPageId',
    data: `{ text: "Index", href: pageLink(#.widget.defaultPageId, {hash:#.params.hash or ''}) }`,
  });
}

function addLinks(discovery: StatoscopeWidget): void {
  discovery.nav.append({
    name: 'diff',
    when: `#.widget | pageId != 'diff' and #.stats.compilations.size()>1`,
    data: `{ text: "Diff", href: pageLink('diff', {hash:#.params.hash or ''}) }`,
  });

  discovery.nav.primary.append({
    name: 'github',
    data: `{ text: "Github", href: 'https://github.com/statoscope/statoscope' }`,
  });

  discovery.nav.primary.append({
    name: 'donate',
    data: `{ text: "Support", href: 'https://opencollective.com/statoscope' }`,
  });
}

function addStatsList(discovery: StatoscopeWidget): void {
  const popup = new discovery.view.Popup({});
  discovery.nav.append({
    name: 'stats-list',
    when: `#.widget and #.stats.compilations.size()>1`,
    content: 'html:"Choose stats &#9660"',
    onClick: (el: HTMLElement) => {
      popup.toggle(el, (popupEl: HTMLElement) =>
        discovery.view.render(
          popupEl,
          [
            // @ts-ignore
            {
              view: 'stats-list',
              data: { showHeader: false },
              onClick(): void {
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

export type SettingOptions<TValue> = { title: string; key: string; defaultValue: TValue };

function makeBooleanSetting(
  discovery: StatoscopeWidget,
  { title, key, defaultValue }: SettingOptions<boolean>
): ViewConfigData {
  return {
    view: 'block',
    className: [settingsStyles.item, settingsStyles.toggle],
    name: key,
    postRender: (
      el: HTMLElement,
      opts: unknown,
      data: unknown,
      { hide }: { hide(): void }
    ): void => {
      const settingValue = settings.get(key, defaultValue);

      render(settingValue.get());

      settingValue.eventChange.on((sender, { value }) => render(value || false));

      function render(value: boolean): void {
        el.innerHTML = '';
        discovery.view.render(
          el,
          // @ts-ignore
          {
            view: 'toggle-group',
            beforeToggles: `text:"${title}"`,
            onChange: (value: boolean) => {
              settingValue.set(value);
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
  };
}

function addSettings(discovery: StatoscopeWidget): void {
  discovery.nav.menu.append(
    makeBooleanSetting(discovery, {
      title: 'Hide node_modules',
      key: SETTING_HIDE_NODE_MODULES,
      defaultValue: SETTING_HIDE_NODE_MODULES_DEFAULT,
    })
  );

  discovery.nav.menu.append(
    makeBooleanSetting(discovery, {
      title: 'Hide child compilations',
      key: SETTING_HIDE_CHILD_COMPILATIONS,
      defaultValue: SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT,
    })
  );

  discovery.nav.menu.append({
    view: 'block',
    className: [settingsStyles.item, settingsStyles.toggle],
    name: 'items-limit',
    postRender: (
      el: HTMLElement,
      opts: unknown,
      data: unknown,
      { hide }: { hide(): void }
    ): void => {
      const limit = settings.get(
        SETTING_LIST_ITEMS_LIMIT,
        SETTING_LIST_ITEMS_LIMIT_DEFAULT
      );

      render(limit.get());

      limit.eventChange.on((sender, { value }) => render(value));

      function render(value: string): void {
        el.innerHTML = '';
        discovery.view.render(
          el,
          // @ts-ignore
          {
            view: 'toggle-group',
            beforeToggles: 'text:"List items limit"',
            onChange: (value: string) => {
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
