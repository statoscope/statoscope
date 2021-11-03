import { ResolverFn } from '@statoscope/helpers/dist/entity-resolver';
import { Extension } from '@statoscope/stats/spec/extension';
import { IndexAPI } from '@statoscope/helpers/dist/indexer';
import Graph from '@statoscope/helpers/dist/graph';
import { StatsDescriptor } from '@statoscope/stats';
import { ErrorObject } from 'ajv';
import { Webpack } from './webpack';
import ChunkID = Webpack.ChunkID;
import Entrypoint = Webpack.Entrypoint;
import RawModule = Webpack.RawModule;
import Asset = Webpack.Asset;
import Chunk = Webpack.Chunk;
import IssuerPathItem = Webpack.IssuerPathItem;
import Compilation = Webpack.Compilation;
import RawReason = Webpack.RawReason;

export type CompilationResolvers = {
  resolveModule: ResolverFn<string, NormalizedModule>;
  resolveChunk: ResolverFn<ChunkID, NormalizedChunk>;
  resolveAsset: ResolverFn<string, NormalizedAsset>;
  resolvePackage: ResolverFn<string, NormalizedPackage>;
  resolveEntrypoint: ResolverFn<string, NormalizedEntrypointItem>;
};

export type NormalizedChunk = Omit<
  Chunk,
  'modules' | 'files' | 'children' | 'parents' | 'siblings'
> & {
  modules: NormalizedModule[];
  files: NormalizedAsset[];
  children: NormalizedChunk[];
  parents: NormalizedChunk[];
  siblings: NormalizedChunk[];
};
export type NormalizedEntrypointItem = { name: string; data: NormalizedEntrypoint };
export type NormalizedEntrypoint = Omit<Entrypoint, 'chunks' | 'assets'> & {
  chunks: NormalizedChunk[];
  assets: NormalizedAsset[];
  dep?: NormalizedModuleDependency;
};
export type NormalizedAsset = Omit<Asset, 'chunks' | 'files'> & {
  chunks: NormalizedChunk[];
  files: File[];
};
export type NormalizedIssuerPathItem = IssuerPathItem & {
  resolvedModule: NormalizedModule | null;
  resolvedEntry?: NormalizedEntrypointItem | null;
  resolvedEntryName?: string | null;
};
export type NormalizedReason = RawReason & {
  resolvedModule: NormalizedModule | null;
  resolvedEntry?: NormalizedEntrypointItem | null;
  resolvedEntryName?: string | null;
};
export type NormalizedModuleDependency = {
  type: 'module';
  module: NormalizedModule;
  reason: NormalizedReason;
};
export type NormalizedModule = Omit<
  RawModule,
  'chunks' | 'reasons' | 'modules' | 'issuerPath'
> & {
  resolvedResource: string | null;
  issuerPath: NormalizedIssuerPathItem[];
  chunks: NormalizedChunk[];
  reasons: NormalizedReason[];
  modules: NormalizedModule[];
  deps?: NormalizedModuleDependency[];
};
export type NormalizedPackage = {
  name: string;
  instances: NodeModuleInstance[];
};
export type NodeModuleInstance = {
  path: string;
  isRoot: boolean;
  reasons: Array<{ type: 'module' | 'entry'; data: NormalizedReason }>;
  modules: NormalizedModule[];
  version?: string;
};

export type NormalizedCompilation = {
  time?: number;
  builtAt?: number;
  name?: string;
  hash: string;
  entrypoints: NormalizedEntrypointItem[];
  chunks: NormalizedChunk[];
  assets: NormalizedAsset[];
  modules: NormalizedModule[];
  nodeModules: NormalizedPackage[];
  children: NormalizedCompilation[];
  isChild: boolean;
  parent: string | null;
};

export type NormalizedExtension<TPayload, TAPI> = {
  data: Extension<TPayload>;
  api: TAPI | null;
};

export type CompilationIndexes = {
  modules: IndexAPI<string, NormalizedModule>;
  chunks: IndexAPI<ChunkID, NormalizedChunk>;
  assets: IndexAPI<string, NormalizedAsset>;
  packages: IndexAPI<string, NormalizedPackage>;
  entrypoints: IndexAPI<string, NormalizedEntrypointItem>;
};

export type EntrypointItem = {
  name: string;
  data: Entrypoint;
};

export type RawIndexes = {
  modules: IndexAPI<string, RawModule>;
  chunks: IndexAPI<ChunkID, Chunk>;
  assets: IndexAPI<string, Asset>;
  entrypoints: IndexAPI<string, EntrypointItem>;
};

export type ModuleGraphNodeData = {
  module: NormalizedModule;
  entries?: NormalizedEntrypointItem[];
};

export type HandledCompilation = {
  data: NormalizedCompilation;
  indexes: CompilationIndexes;
  resolvers: CompilationResolvers;
  graph: {
    module: Graph<ModuleGraphNodeData>;
  };
  file: NormalizedFile;
};

export type ProcessingContext = {
  fileContext: HandledFileContext;
  indexes: CompilationIndexes;
  rawIndexes: RawIndexes;
  resolvers: CompilationResolvers;
};

export type HandledFileContext = {
  indexes: {
    extensions: IndexAPI<string, NormalizedExtension<unknown, unknown>>;
  };
  resolvers: {
    resolveExtension: ResolverFn<string, NormalizedExtension<unknown, unknown>>;
  };
};

export type ValidationResult =
  | {
      result: false;
      errors: ErrorObject[];
    }
  | { result: true };

export type RawStatsFileDescriptor = { name: string; data: Compilation };

export type NormalizedFile = {
  name: string;
  version: string;
  validation: ValidationResult;
  compilations: NormalizedCompilation[];
  __statoscope?: { descriptor?: StatsDescriptor; extensions?: Extension<unknown>[] };
};

export type HandledStats = {
  file: NormalizedFile;
  compilations: HandledCompilation[];
  indexes: {
    extensions: IndexAPI<string, NormalizedExtension<unknown, unknown>>;
  };
  resolvers: {
    resolveExtension: ResolverFn<string, NormalizedExtension<unknown, unknown>>;
  };
};

export type NormalizeResult = {
  files: NormalizedFile[];
  compilations: HandledCompilation[];
  resolvers: Map<string, HandledStats['resolvers']>;
  indexes: Map<string, HandledStats['indexes']>;
};
