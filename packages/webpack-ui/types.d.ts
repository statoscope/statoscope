import { NormalizedFile, RawStatsFileDescriptor } from '@statoscope/webpack-model/types';
import { DiscoverJS, Extension, PrepareFn, Widget } from '@statoscope/types';

export type RawData = RawStatsFileDescriptor | RawStatsFileDescriptor[];

export type TargetData = NormalizedFile[];

export type Context = {
  name: string;
  stats: NormalizedFile[];
  rawData: RawStatsFileDescriptor[];
};

export type StatoscopeWidget = Widget<RawData, TargetData, Context>;

export type InitArg = {
  element: HTMLElement;
  data: RawData;
  name: string;
  prepare: (discovery: StatoscopeWidget) => PrepareFn<RawData, TargetData>;
  views: Extension;
  pages: Extension;
};

declare module '@statoscope/webpack-ui' {
  export default function (data: RawData, element: HTMLElement): StatoscopeWidget;
  export const Discovery: typeof DiscoverJS;
}

// @ts-ignore
declare module '@statoscope/ui-webpack' {
  export default function (data: RawData, element: HTMLElement): StatoscopeWidget;
  export const Discovery: typeof DiscoverJS;
}
