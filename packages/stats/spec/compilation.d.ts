import { Module } from './module';
import { Asset } from './asset';

export type CompilationID = string;
export type Compilation = {
  id: CompilationID;
  modules: Module[];
  assets: Asset[];
};
