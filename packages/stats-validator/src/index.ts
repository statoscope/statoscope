import fs from 'fs';
import module from 'module';
// @ts-ignore
import { parseChunked } from '@discoveryjs/json-ext';
import { API, makeAPI } from './api';
import { InputFile, PluginFn, PrepareFn } from './plugin';
import { Rule } from './rule';
import { Config, RuleExecParams } from './config';

export type ValidationResult = {
  rules: Array<{
    name: string;
    api: API;
  }>;
};

export default class Validator {
  public config?: Config;
  public plugins: Record<
    string,
    {
      aliases: string[];
      prepare?: PrepareFn<unknown>;
      rules: Record<string, Rule<unknown>>;
    }
  > = {};

  constructor(public configPath?: string) {
    if (!configPath) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.config = require(configPath) as Config;

    if (this.config.plugins) {
      for (const pluginDesc of this.config.plugins) {
        const pluginPath = Array.isArray(pluginDesc) ? pluginDesc[0] : pluginDesc;
        // todo resolve plugin aliases
        const pluginAlias = Array.isArray(pluginDesc) ? pluginDesc[1] : 'unknown';
        const requirePlugin = module.createRequire(this.configPath as string);
        const resolvedPluginPath = requirePlugin.resolve(pluginPath);
        const pluginNS = requirePlugin(resolvedPluginPath);
        const plugin = (pluginNS.default ?? pluginNS) as PluginFn<unknown>;
        const pluginDescription = plugin();

        this.plugins[resolvedPluginPath] = {
          rules: {},
          aliases: [pluginAlias],
          prepare: pluginDescription.prepare,
        };

        if (pluginDescription.rules) {
          for (const [name, rule] of Object.entries(pluginDescription.rules)) {
            this.plugins[resolvedPluginPath].rules[name] = rule;
          }
        }
      }
    }
  }

  resolveRule(name: string): Rule<unknown> | null {
    const ruleRx = /^(?:(@.+?[/\\][^/\\\s]+|[^/\\\s]+)[/\\])?(.+)/;
    const [, pluginAlias, ruleName] = name.match(ruleRx) || [];

    for (const [, pluginDesc] of Object.entries(this.plugins)) {
      if (pluginDesc.aliases.includes(pluginAlias)) {
        if (Object.prototype.hasOwnProperty.call(pluginDesc.rules, ruleName)) {
          return pluginDesc.rules[ruleName];
        }
      }
    }

    return null;
  }

  async validate(files: string[]): Promise<ValidationResult> {
    const parsedFiles: InputFile[] = [];
    let prepared: unknown;

    for (const file of files) {
      parsedFiles.push({
        name: file,
        data: await parseChunked(fs.createReadStream(file)),
      });
    }

    const result: ValidationResult = {
      rules: [],
    };

    for (const [, plugin] of Object.entries(this.plugins)) {
      if (typeof plugin.prepare === 'function') {
        prepared = await plugin.prepare(parsedFiles);
      }
    }

    for (const [ruleName, ruleDesc] of Object.entries(this.config?.rules ?? {})) {
      let ruleParams: unknown;
      let execParams: RuleExecParams;

      if (Array.isArray(ruleDesc)) {
        [execParams, ruleParams] = ruleDesc;
      } else {
        execParams = ruleDesc;
      }

      const api = makeAPI({ warnAsError: false });
      const resolvedRule = this.resolveRule(ruleName);

      if (!resolvedRule) {
        throw new Error(`Can't resolve rule ${ruleName}`);
      }

      if (typeof execParams === 'string') {
        if (execParams === 'off') {
          continue;
        }
      } else if (execParams.mode === 'off') {
        continue;
      }

      await resolvedRule(ruleParams, prepared, api);
      result.rules.push({ name: ruleName, api });
    }

    return result;
  }
}
