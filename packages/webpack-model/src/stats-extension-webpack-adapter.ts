import { Extension } from '@statoscope/stats/spec/extension';
import { Compiler } from 'webpack';

export interface StatsExtensionWebpackAdapter<TPayload> {
  handleCompiler(compiler: Compiler, context: string): void;
  getExtension(): Extension<TPayload>;
}
