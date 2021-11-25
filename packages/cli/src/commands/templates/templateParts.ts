import { FileExt, RuleTemplatesPartsFromFileExt, TemplateOptions } from './types';

type TemplateParts = {
  imports: string;
  body: string;
  exports: string;
};

export function templatePartsByOptions(
  templateOptions: TemplateOptions,
  templates: RuleTemplatesPartsFromFileExt
): TemplateParts {
  const templateByLangType =
    templateOptions.output.fileExt === FileExt.ts
      ? templates[FileExt.ts]
      : templates[FileExt.js];

  const moduleType = templateOptions.output.module;

  const templateByModuleType = {
    imports:
      typeof templateByLangType.imports === 'string'
        ? templateByLangType.imports
        : templateByLangType.imports[moduleType],
    body: templateByLangType.body,
    exports:
      typeof templateByLangType.exports === 'string'
        ? templateByLangType.exports
        : templateByLangType.exports[moduleType],
  };

  return templateByModuleType;
}

export function concatTemplateParts(templateParts: TemplateParts): string {
  let template = '';

  if (templateParts.imports) {
    template += templateParts.imports;
    template += '\n\n';
  }

  template += templateParts.body;

  if (templateParts.exports) {
    template += '\n\n';
    template += templateParts.exports;
  }

  return template;
}
