import ts from 'typescript';
import WebpackCompressedExtension from '@statoscope/webpack-stats-extension-compressed';
import StatoscopeWebpackPlugin from './index';

test('accepts gzip presets with optional zlib settings', () => {
  for (const plugin of [
    new StatoscopeWebpackPlugin({ compressor: ['gzip'] }),
    new StatoscopeWebpackPlugin({ compressor: ['gzip', { level: 9 }] }),
  ]) {
    const extension = plugin.extensions.find(
      (item) => item instanceof WebpackCompressedExtension,
    ) as WebpackCompressedExtension;

    expect(extension.compressor).toBe(plugin.options.compressor);
  }
});

test('typechecks the public compressor option', () => {
  const program = ts.createProgram([__filename], {
    target: ts.ScriptTarget.ES2019,
    module: ts.ModuleKind.CommonJS,
    strict: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    noEmit: true,
    types: ['node', 'jest'],
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);
  expect(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getCanonicalFileName: (filename) => filename,
      getNewLine: () => '\n',
    }),
  ).toBe('');
});
