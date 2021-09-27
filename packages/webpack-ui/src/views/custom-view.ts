import md5 from 'md5';
import { ViewConfig } from '@statoscope/types';
import { StatoscopeWidget } from '../../types';

const sessionStorageKey = `STATOSCOPE_VIEW_CUSTOM_VIEW_ALLOW`;

function getSessionStorage(): Record<string, boolean> {
  return JSON.parse(sessionStorage.getItem(sessionStorageKey) ?? `{}`);
}

function updateSessionStorage(view: string): void {
  const hash = md5(view);
  const allowedViews = getSessionStorage();
  allowedViews[hash] = true;
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(allowedViews));
}

function isAllowed(view: string): boolean {
  const hash = md5(view);
  const allowedViews = getSessionStorage();

  return !!allowedViews[hash];
}

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define(
    'custom-view',
    (
      el,
      config,
      theData?: {
        data: unknown;
        view: ViewConfig<unknown, unknown>;
      },
      context?
    ) => {
      const { view = [], data } = theData || {};
      let normalizedView = view;
      const warningText = `A view for this report is a script.
      
To see the report this script should be executed in your browser.

**It might be unsecure!** Do you allow to execute the script?

> Click \`Allow\` only if you trust the report source.`;

      if (typeof normalizedView === 'string') {
        if (isAllowed(normalizedView)) {
          renderReport(normalizedView);
          return;
        }

        normalizedView = {
          view: 'alert-warning',
          content: [
            `md:${JSON.stringify(warningText)}`,
            {
              view: 'button-danger',
              onClick(): void {
                renderReport(view as string);
              },
              data: {
                text: 'Allow',
              },
            },
          ],
        };
      }

      discovery.view.render(el, normalizedView, data, context);

      function renderReport(view: string): void {
        updateSessionStorage(view);
        const normalizedView = Function(
          `const view = ${view.trim()}; return typeof view === 'function' ? view() : view;`
        )() as ViewConfig<unknown, unknown>;

        el.innerHTML = '';
        discovery.view.render(el, normalizedView, data, context);
      }
    }
  );
}
