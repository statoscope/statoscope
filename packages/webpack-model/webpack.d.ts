export declare namespace Webpack {
  type IssuerPathItem = {
    id: string;
    identifier: string;
    name: string;
  };

  type Module = {
    id: string;
    name: string;
    size: number;
    issuerPath?: IssuerPathItem[];
    chunks: Array<Chunk | string>;
    reasons?: Reason[];
    modules?: Module[];
  };

  type Reason = {
    moduleName: string;
    loc: string;
  };

  type Entrypoint = {
    name: string;
    chunks?: Array<string | Chunk>;
    assets?: Array<string | File>;
    isOverSizeLimit: boolean;
  };

  type Chunk = {
    id: string;
    name: string;
    names: string[];
    modules?: Module[];
    reason?: string | null;
    children?: Array<string | Chunk>;
    siblings?: Array<string | Chunk>;
    parents?: Array<string | Chunk>;
    origins?: Array<Reason>;
    files: Array<string | File>;
  };

  type File = {
    name: string;
    size: number;
  };

  type Asset = {
    name: string;
    chunks?: Array<string | Chunk>;
    files: File[];
  };

  type Compilation = {
    time?: number;
    builtAt?: number;
    version?: string;
    name?: string;
    hash?: string;
    entrypoints?: Record<string, Entrypoint>;
    chunks?: Chunk[];
    assets?: Asset[];
    modules?: Module[];
    children?: Compilation[];
  };
}
