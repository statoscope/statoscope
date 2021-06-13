import { Stats } from '@statoscope/stats';

export declare namespace Webpack {
  type IssuerPathItem = {
    id: number | string | null;
    identifier: string;
    name: string;
  };

  type ModuleID = string | number | null;

  type Module = {
    id: ModuleID;
    name: string;
    size: number;
    issuerPath?: IssuerPathItem[] | null;
    chunks: Array<Chunk | ChunkID>;
    reasons?: Reason[];
    modules?: InnerModule[];
  };

  type InnerModule = Omit<Module, 'id' | 'modules'> & { id: null };

  type Reason = {
    moduleName: string | null;
    loc: string;
  };

  type Entrypoint = {
    name: string;
    chunks?: Array<ChunkID | Chunk>;
    assets?: Array<string | File>;
    isOverSizeLimit: boolean;
  };

  type ChunkID = number | string;

  type Chunk = {
    id: ChunkID;
    name?: string;
    names: string[];
    modules?: Module[];
    size: number;
    reason?: string | null;
    children?: Array<ChunkID | Chunk>;
    siblings?: Array<ChunkID | Chunk>;
    parents?: Array<ChunkID | Chunk>;
    origins?: Array<Reason>;
    files: Array<string | File>;
  };

  type File = {
    name: string;
    size: number;
  };

  type Asset = {
    name: string;
    size: number;
    chunks?: Array<ChunkID | Chunk>;
    files?: File[];
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
    __statoscope?: Stats;
  };
}
