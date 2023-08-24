export type ViewRenderFn<TData, TContext> = (
  el: HTMLElement,
  config: ViewConfig<TData, TContext>,
  data?: TData,
  context?: TContext
) => Promise<void> | void;
export type ViewDefineConfig<TData, TContext> =
  | ViewRenderFn<TData, TContext>
  | ViewConfig<TData, TContext>;
export type ViewConfig<TData, TContext> =
  | ViewConfigData
  | string
  | ViewConfig<TData, TContext>[];
export type QueryFn<TData, TContext> = (data: TData, TData: TContext) => unknown;
export type Query<TData, TContext> = string | QueryFn<TData, TContext> | unknown;
export type ClassNameFn<TData, TContext> = (
  data: TData,
  context: TContext
) => string | false | null | undefined;

interface ViewOptions {
  tag?: string | false | null;
}

interface View<TData, TContext> {
  name: string;
  options: ViewOptions;
  render: ViewRenderFn<TData, TContext>;
}

type ViewConfigData = Record<string, unknown>;

interface Page<TData, TContext> {
  name: string;
  options?: PageOptions;
  render: (el: HTMLElement, data?: TData, context?: TContext) => RenderState;
}

interface PageOptions {
  reuseEl?: boolean;
  init?: unknown;
  keepScrollOffset?: boolean;
  resolveLink?: string | unknown;
}

interface RenderState {
  pageEl: HTMLElement;
  renderState: Promise<void>;
}

type Extension = Extension[] | { [key: string]: Extension };

export interface WidgetOptions {
  container?: HTMLElement;
  defaultPageId?: string;
  isolateStyleMarker?: string;
  compact?: boolean;
  extensions?: Extension;
}

export type PrepareFn<TRawData, TData> = (data: TRawData) => TData;

export type RenderContext<TContext> = {
  page: string;
  id?: string;
  params: Record<string, unknown>;
} & TContext;

export class PopupView {
  constructor(config: unknown);

  toggle(el: HTMLElement, fn: (popupEl: HTMLElement) => void): void;

  hide(): void;
}

export type ObjectMarkerOptions<TValue> = {
  refs?: string[];
  lookupRefs?: string[];
  ref?: string;
  page: string;
  title?: (value: TValue) => string;
};

export type MarkObject<TValue> = (value: TValue) => void;

export type HelpersContext = {
  query: (request: string, input?: unknown, context?: unknown) => unknown;
};

export class Widget<TRawData, TData, TContext> {
  dom: Record<string, HTMLElement>;
  view: {
    define<TData, TContext>(
      name: string,
      render: ViewDefineConfig<TData, TContext>,
      options?: ViewOptions
    ): void;
    render<TData, TContext>(
      ...args: Parameters<ViewRenderFn<TData, TContext>>
    ): ReturnType<ViewRenderFn<TData, TContext>>;
    Popup: new (config: unknown) => PopupView;
  };
  page: {
    define(
      name: string,
      render: ViewDefineConfig<TData, TContext>,
      options?: PageOptions
    ): void;
    render(
      prevPageEl: HTMLElement,
      name: string,
      data?: TData,
      context?: TContext
    ): RenderState;
  };

  data: TData;

  apply(extension: Extension): void;

  setData(data: TRawData, context?: TContext): Promise<void>;

  setPrepare<TRawData, TData>(fn: PrepareFn<TRawData, TData>): void;

  renderPage(): RenderState;

  getRenderContext(): RenderContext<TContext>;

  encodePageHash(
    pageId: string,
    pageRef?: string | number,
    pageParams?: Record<string, unknown>
  ): string;

  addQueryHelpers(extensions: { [key: string]: unknown }): void;

  defineObjectMarker<TValue>(
    name: string,
    options: ObjectMarkerOptions<TValue>
  ): MarkObject<TValue>;

  query: HelpersContext['query'];

  nav: {
    prepend(config: Omit<ViewConfigData, 'view'>): void;
    append(config: Omit<ViewConfigData, 'view'>): void;
    remove(name: string): void;

    primary: {
      append(config: Omit<ViewConfigData, 'view'>): void;
    };

    menu: {
      append(config: ViewConfigData): void;
    };
  };

  constructor(options?: WidgetOptions);
}

export type RelationItem =
  | {
      type:
        | 'module'
        | 'package'
        | 'package-instance'
        | 'resource'
        | 'entry'
        | 'compilation';
      id: string;
    }
  | {
      type: 'chunk';
      id: string | number;
    };

declare namespace DiscoverJS {
  export type ReadonlyPublisher<T> = {
    subscribe(callback: PublisherCallback<T>, thisArg: any): () => void;
    subscribeSync(callback: PublisherCallback<T>, thisArg: any): () => void;
    unsubscribe(callback: PublisherCallback<T>, thisArg: any): void;
    get value(): T;
  };

  export type PublisherCallback<T> = (value: T, unsubscribe: () => void) => void;

  export class Publisher<T> {
    static setValue<T>(publisher: Publisher<T>, value: T): boolean | any[];

    constructor(initValue: T, shouldPublish: (newValue: T, oldValue: T) => boolean);

    get readonly(): boolean;

    subscribe(callback: PublisherCallback<T>, thisArg: any): () => void;

    subscribeSync(callback: PublisherCallback<T>, thisArg: any): () => void;

    unsubscribe(callback: PublisherCallback<T>, thisArg: any): void;

    shouldPublish(newValue: T, oldValue: T): boolean;

    set(value: T): boolean;

    asyncSet(value: T): Promise<boolean>;
  }

  export type ProgressBarState = { stage: string; progress?: number; error?: boolean };
  export type ProgressBarTimingEntry = { stage: string; title: string; duration: number };

  export class ProgressBar extends Publisher<ProgressBarState> {
    el: HTMLDivElement;
    constructor(options: {
      onTiming?: (entry: ProgressBarTimingEntry) => void;
      onFinish?: () => ProgressBarTimingEntry[];
      delay?: true | number;
      domReady?: () => Promise<void>;
    });
    recordTiming(stage: string, start: number, end?: number): void;
    setState(state: ProgressBarState): Promise<void>;
    finish(error: boolean): void;
    dispose(): void;
  }

  type LoaderResult<T> = {
    state: Publisher<ProgressBarState>;
    result: Promise<{ data: T }>;
  };

  export const utils: {
    progressbar: ProgressBar;
    loadDataFromStream<T>(stream: ReadableStream, options: any): LoaderResult<T>;
    loadDataFromFile<T>(file: File, options: any): LoaderResult<T>;
    loadDataFromEvent<T>(event: DragEvent, options: any): LoaderResult<T>;
    loadDataFromUrl<T>(url: string, options: any): LoaderResult<T>;
    syncLoaderWithProgressbar<T>(
      loader: LoaderResult<T>,
      progressbar: ProgressBar
    ): Promise<void>;
  };
}
