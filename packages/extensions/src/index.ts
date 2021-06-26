export type ContainerItem<TData, TAPI> = {
  version: string;
  apiFactory: APIFactory<TData, TAPI>;
};
export type APIFactory<TData, TAPI> = (data: TData) => TAPI;

export default class Container {
  private extensions: Map<string, ContainerItem<unknown, unknown>> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(name: string, version: string, apiFactory: APIFactory<any, any>): void {
    this.extensions.set(name, { version, apiFactory });
  }

  resolve<TAPI>(name: string): ContainerItem<unknown, TAPI> | null {
    const item = this.extensions.get(name);

    if (!item) {
      return null;
    }

    return item as ContainerItem<unknown, TAPI>;
  }
}
