export type ExtensionDescriptor = {
  name: string;
  version: string;
  author?: { name: string; url?: string; email?: string } | string;
  homepage?: string;
  adapter?: ExtensionDescriptor;
};

export type Extension<TPayload> = {
  descriptor: ExtensionDescriptor;
  payload: TPayload;
};
