import { configTemplate } from './config';
import { pluginTemplate } from './plugin';
import { reporterTemplate } from './reporter';
import { ruleTemplate } from './rule';

export const enum FileExt {
  js = 'js',
  ts = 'ts',
}

const mapper = {
  config: configTemplate,
  rule: ruleTemplate,
  reporter: reporterTemplate,
  plugin: pluginTemplate,
} as const;

export type TemplateName = keyof typeof mapper;

export function getTemplate(templateName: TemplateName, fileExt: FileExt): string {
  if (templateName === 'rule') {
    return mapper.rule(fileExt, {
      export: true,
      import: true,
    });
  }
  return mapper[templateName](fileExt);
}
