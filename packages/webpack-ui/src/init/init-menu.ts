import networkTypeList from '@statoscope/helpers/dist/network-type-list';
import {
  SETTING_ASSETS_INJECT_TYPE,
  SETTING_ASSETS_INJECT_TYPE_DEFAULT,
  SETTING_EXCLUDE_RESOURCES_FROM_SIZE_CALC,
  SETTING_EXCLUDE_RESOURCES_FROM_SIZE_CALC_DEFAULT,
  SETTING_HIDE_CHILD_COMPILATIONS,
  SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT,
  SETTING_HIDE_NODE_MODULES,
  SETTING_HIDE_NODE_MODULES_DEFAULT,
  SETTING_LIST_ITEMS_LIMIT,
  SETTING_LIST_ITEMS_LIMIT_DEFAULT,
  SETTING_NETWORK_SPEED,
  SETTING_NETWORK_SPEED_DEFAULT,
  SETTING_SHOW_COMPRESSED,
  SETTING_SHOW_COMPRESSED_DEFAULT,
} from '../settings';
import { StatoscopeWidget } from '../../types';
import {
  makeBooleanSetting,
  makeSelectSetting,
  makeStringSetting,
  makeToggleSetting,
} from './settings';

export default (discovery: StatoscopeWidget): void => {
  hideUseless(discovery);
  addCustomIndex(discovery);
  addReportsList(discovery);
  addStatsList(discovery);
  addSettings(discovery);
  addLinks(discovery);
};

function hideUseless(discovery: StatoscopeWidget): void {
  discovery.nav.remove('index-page');
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
    data: `{ 
      text: "Diff",
      href: pageLink('diff', {
        diffWith: resolveInputFile().compilations.pick().hash or '',
        hash: resolveReferenceFile().compilations.pick().hash or #.params.hash or ''
      })
    }`,
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

function addReportsList(discovery: StatoscopeWidget): void {
  const popup = new discovery.view.Popup({});
  discovery.nav.append({
    name: 'custom-reports-list',
    when: `#.widget and #.stats.(
      $file: $;
      compilations.(
        $compilation: $;
        $file.name.customReports_getItems($compilation.hash)
      )
    )`,
    content: 'html:"Custom reports &#9660"',
    onClick: (el: HTMLElement) => {
      popup.toggle(el, (popupEl: HTMLElement) =>
        discovery.view.render(
          popupEl,
          [
            // @ts-ignore
            {
              view: 'custom-reports-list',
              data: {},
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

  discovery.nav.menu.append(
    makeBooleanSetting(discovery, {
      title: 'Show compressed size',
      hint: 'Makes sense only when @statoscope/webpack-plugin used',
      key: SETTING_SHOW_COMPRESSED,
      defaultValue: SETTING_SHOW_COMPRESSED_DEFAULT,
    })
  );

  discovery.nav.menu.append(
    makeToggleSetting(
      discovery,
      {
        title: 'List items limit',
        key: SETTING_LIST_ITEMS_LIMIT,
        defaultValue: SETTING_LIST_ITEMS_LIMIT_DEFAULT,
      },
      [
        { value: '10', text: '10' },
        { value: '20', text: '20' },
        { value: '50', text: '50' },
        { value: '100', text: '100' },
      ]
    )
  );

  discovery.nav.menu.append(
    makeSelectSetting(
      discovery,
      {
        title: 'Network type',
        key: SETTING_NETWORK_SPEED,
        defaultValue: SETTING_NETWORK_SPEED_DEFAULT,
      },
      networkTypeList.map((item) => item.name),
      'settingNetworkType()',
      'getNetworkTypeInfo().getNetworkTypeName()'
    )
  );

  discovery.nav.menu.append(
    makeToggleSetting(
      discovery,
      {
        title: 'Assets inject type',
        hint: 'sync: download time = sum(downloadTime(assets))\nasync: dowload time = max(downloadTime(assets))',
        key: SETTING_ASSETS_INJECT_TYPE,
        defaultValue: SETTING_ASSETS_INJECT_TYPE_DEFAULT,
      },
      ['sync', 'async']
    )
  );

  discovery.nav.menu.append(
    makeStringSetting(
      discovery,
      {
        title: 'Ignore from size calculation',
        hint: 'Ignore matched resources from size calculation',
        key: SETTING_EXCLUDE_RESOURCES_FROM_SIZE_CALC,
        defaultValue: SETTING_EXCLUDE_RESOURCES_FROM_SIZE_CALC_DEFAULT,
      },
      'regexp'
    )
  );
}
