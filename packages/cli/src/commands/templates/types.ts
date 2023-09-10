export const enum FileExt {
  js = 'js',
  ts = 'ts',
}

export const enum ModuleType {
  commonjs = 'commonjs',
  esm = 'esm',
}

export type TemplateOptions =
  | {
      output: {
        fileExt: FileExt.js;
        module: ModuleType.commonjs | ModuleType.esm;
      };
    }
  | {
      output: {
        fileExt: FileExt.ts;
        module: ModuleType.esm;
      };
    };

export type Template<TAdditionalOptions = undefined> = (
  templateOptions: TemplateOptions,
  additionalOptions?: TAdditionalOptions,
) => string;

export type RuleTemplatesPartsFromFileExt = {
  [FileExt.ts]: {
    imports: string;
    body: string;
    exports: string;
  };
  [FileExt.js]: {
    imports: {
      esm: string;
      commonjs: string;
    };
    body: string;
    exports: {
      commonjs: string;
      esm: string;
    };
  };
};
