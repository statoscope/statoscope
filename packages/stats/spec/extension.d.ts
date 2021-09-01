export type PackageDescriptor = {
  name: string;
  version: string;
  description?: string;
  author?: { name: string; url?: string; email?: string } | string;
  homepage?: string;
};

export type ExtensionDescriptor = PackageDescriptor & {
  adapter?: ExtensionDescriptor;
};

export type Extension<TPayload> = {
  descriptor: ExtensionDescriptor;
  payload: TPayload;
};
