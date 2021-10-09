import { ViewConfig } from '@statoscope/types';
import { StatoscopeWidget } from '../../types';

export type Options = {
  display?: 'block' | 'flex' | 'inline-flex';
  direction?: 'row' | 'column';
  shrink?: string;
  grow?: string;
  alignItems: string;
  justifyItems: string;
  alignContent: string;
  justifyContent: string;
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
};

const stylesMap: Record<keyof Options, keyof CSSStyleDeclaration> = {
  display: 'display',
  direction: 'flexDirection',
  shrink: 'flexShrink',
  grow: 'flexGrow',
  alignItems: 'alignItems',
  justifyItems: 'justifyItems',
  alignContent: 'alignContent',
  justifyContent: 'justifyContent',
  width: 'width',
  height: 'height',
  padding: 'padding',
  margin: 'margin',
};

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('box', (el, config, data?: Options, context?: unknown) => {
    el.style.display = data?.display ?? 'flex';

    // @ts-ignore
    for (const [name, value] of Object.entries(config.options ?? {})) {
      // eslint-disable-next-line no-prototype-builtins
      if (stylesMap.hasOwnProperty(name)) {
        // @ts-ignore
        el.style[stylesMap[name]] = value;
      }
    }

    // @ts-ignore
    const content: ViewConfig<unknown, unknown> = config.content ?? [];

    return discovery.view.render(el, content, data, context);
  });
}
