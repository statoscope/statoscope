import { ViewConfig } from '@statoscope/types';
import { StatoscopeWidget } from '../../types';

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

      discovery.view.render(el, view, data, context);
    }
  );
}
