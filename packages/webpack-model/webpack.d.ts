import { StatsDescriptor } from '@statoscope/stats';
import { Extension } from '@statoscope/stats/spec/extension';

export declare namespace Webpack {
  type IssuerPathItem = {
    id: number | string | null;
    identifier: string;
    name: string;
  };

  type ModuleID = string | number | null;

  type Module = {
    id: ModuleID;
    identifier: string;
    name: string;
    size: number;
    issuerPath?: IssuerPathItem[] | null;
    chunks?: Array<Chunk | ChunkID>;
    reasons?: Reason[];
    modules?: InnerModule[];
    optimizationBailout?: string[];
  };

  type InnerModule = Omit<Module, 'id' | 'modules'> & { id: null };

  type Reason = {
    type?: string;
    moduleIdentifier: string | null;
    moduleName: string | null;
    loc?: string;
  };

  type Entrypoint = {
    name?: string;
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
    __statoscope?: StatoscopeMeta;
  };
}

export type StatoscopeMeta = {
  descriptor?: StatsDescriptor;
  extensions?: Extension<unknown>[];
  normalization?: NormalizationData;
  context?: string;
};

export type ModuleData = {
  idToIxMap: Map<string, number>;
  ixToModuleMap: Map<number, Webpack.Module>;
  lastId: number;
};

export type CompilationData = {
  modules: ModuleData;
};

export type CompilationMap = Map<string, CompilationData>;

export type NormalizationData = {
  links: { modules: ['chunks'] };
  data: {
    compilations: Array<{
      id: string;
      data: {
        modules: Array<[number, Webpack.Module]>;
      };
    }>;
  };
};
