import { ViewConfig, ViewConfigData } from '@statoscope/types';
import { StatoscopeWidget } from '../../types';
import settings, { Value } from '../settings';
// @ts-ignore
import settingsStyles from '../settings-styles.css';

export type SettingOptions<TValue> = {
  title: string;
  key: string;
  hint?: string;
  defaultValue: TValue;
};

export function makeSettingItem<TType>(
  discovery: StatoscopeWidget,
  setting: SettingOptions<TType>,
  render: (
    settingValue: Value<TType>,
    setting: SettingOptions<TType>,
    hide: () => void,
  ) => ViewConfig<unknown, unknown>,
): ViewConfigData {
  return {
    view: 'block',
    className: [settingsStyles.item],
    name: setting.key,
    postRender: (
      el: HTMLElement,
      opts: unknown,
      data: unknown,
      { hide }: { hide(): void },
    ): void => {
      const settingValue = settings.get(setting.key, setting.defaultValue);

      renderInt();

      settingValue.eventChange.on(() => renderInt());

      function renderInt(): void {
        el.innerHTML = '';
        discovery.view.render(
          el,
          [
            {
              view: 'block',
              content: render(settingValue, setting, hide),
            },
          ],
          null,
          { widget: discovery },
        );
      }
    },
  };
}

export function makeBooleanSetting(
  discovery: StatoscopeWidget,
  setting: SettingOptions<boolean>,
): ViewConfigData {
  return makeSettingItem(discovery, setting, (settingValue, setting, hide) => {
    return [
      {
        view: 'block',
        content: [
          {
            view: 'checkbox',
            onChange: (value: boolean): void => {
              settingValue.set(value);
              hide();
            },
            checked: settingValue.get(),
            content: (element: HTMLDivElement): void => {
              if (setting.hint) {
                element.title = setting.hint;
              }

              element.classList.add(settingsStyles.title);

              discovery.view.render(element, [
                {
                  view: 'block',
                  content: [`text:"${setting.title}"`],
                },
                {
                  view: 'block',
                  when: JSON.stringify(!!setting.hint),
                  className: settingsStyles.hasHint,
                },
              ]);
            },
          },
        ],
      },
    ];
  });
}

export function makeToggleSetting<TType>(
  discovery: StatoscopeWidget,
  setting: SettingOptions<TType>,
  items: Array<{ value: TType; text: string } | string>,
): ViewConfigData {
  return makeSettingItem(discovery, setting, (settingValue, setting, hide) => {
    return [
      {
        view: 'block',
        content: [
          (element: HTMLDivElement): void => {
            if (setting.hint) {
              element.title = setting.hint;
            }

            element.classList.add(settingsStyles.title);

            discovery.view.render(element, [
              `text:"${setting.title}"`,
              {
                view: 'block',
                when: JSON.stringify(!!setting.hint),
                className: settingsStyles.hasHint,
              },
            ]);
          },
        ],
      },
      {
        view: 'block',
        content: [
          {
            view: 'toggle-group',
            onChange: (value: TType): void => {
              settingValue.set(value);
              hide();
            },
            value: settingValue.get(),
            data: items,
          },
        ],
      },
    ];
  });
}

export function makeSelectSetting<TType>(
  discovery: StatoscopeWidget,
  setting: SettingOptions<TType>,
  items: TType[],
  valueHandler: string,
  textHandler: string,
): ViewConfigData {
  return makeSettingItem(discovery, setting, (settingValue, setting, hide) => {
    return [
      {
        view: 'block',
        content: [
          (element: HTMLDivElement): void => {
            if (setting.hint) {
              element.title = setting.hint;
            }

            element.classList.add(settingsStyles.title);

            discovery.view.render(element, [
              `text:"${setting.title}"`,
              {
                view: 'block',
                when: JSON.stringify(!!setting.hint),
                className: settingsStyles.hasHint,
              },
            ]);
          },
        ],
      },
      {
        view: 'block',
        content: [
          {
            view: 'select',
            onChange: (value: TType): void => {
              settingValue.set(value);
              hide();
            },
            value: valueHandler,
            text: textHandler,
            data: items,
          },
        ],
      },
    ];
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeDebounceFn<TArgs extends any[], TFn extends (...args: TArgs) => void>(
  fn: TFn,
  timeout = 1000,
): (...args: TArgs) => void {
  let timer: NodeJS.Timeout | null = null;
  return (...args): void => {
    clearTimeout(timer as NodeJS.Timeout);
    timer = setTimeout(() => fn(...args), timeout);
  };
}

export function makeStringSetting(
  discovery: StatoscopeWidget,
  setting: SettingOptions<string>,
  placeholder = '',
): ViewConfigData {
  return makeSettingItem(discovery, setting, (settingValue, setting) => {
    return [
      {
        view: 'block',
        content: [
          (element: HTMLDivElement): void => {
            if (setting.hint) {
              element.title = setting.hint;
            }

            element.classList.add(settingsStyles.title);

            discovery.view.render(element, [
              `text:"${setting.title}"`,
              {
                view: 'block',
                when: JSON.stringify(!!setting.hint),
                className: settingsStyles.hasHint,
              },
            ]);
          },
        ],
      },
      {
        view: 'block',
        content: [
          {
            view: 'input',
            placeholder,
            onChange: makeDebounceFn((value: string): void => {
              settingValue.set(value);
            }),
            value: JSON.stringify(settingValue.get()),
          },
        ],
      },
    ];
  });
}
