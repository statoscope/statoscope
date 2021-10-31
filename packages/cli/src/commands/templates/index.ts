import { configTemplate } from './config';
import { pluginTemplate } from './plugin';
import { reporterTemplate } from './reporter';
import { ruleTemplate } from './rule';

const mapper = {
  config: configTemplate,
  rule: ruleTemplate,
  reporter: reporterTemplate,
  plugin: pluginTemplate,
} as const;

export type TemplateName = keyof typeof mapper;

export function getTemplate(templateName: TemplateName): string {
  return mapper[templateName]();
}
