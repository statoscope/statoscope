import fs from 'fs';
import module from 'module';
// @ts-ignore
import { parseChunked } from '@discoveryjs/json-ext';
import { API, makeAPI, MakeAPIParams } from './api';
import { InputFile, PluginFn, PrepareFn } from './plugin';
import { Rule, RuleDataInput } from './rule';
import { Config, NormalizedRuleExecParams, RuleExecMode, RuleExecParams } from './config';

export type ValidationResultItem = {
  name: string;
  api: API;
};

export type ValidationResult = {
  rules: Array<ValidationResultItem>;
  input: string[];
  reference: string[];
};

export default class Validator {
  // @ts-ignore
  public configPath: string;
  // @ts-ignore
  public config: Config;
  public plugins: Record<
    string,
    {
      aliases: string[];
      prepare?: PrepareFn<unknown>;
      rules: Record<string, Rule<unknown, unknown>>;
    }
  > = {};

  constructor(configPath: string) {
    this.applyConfig(configPath);
  }

  applyConfig(configPath: string): void {
    this.configPath = configPath;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.config = require(this.configPath) as Config;

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

  resolveRule(name: string): Rule<unknown, unknown> | null {
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

  async validate(
    input: string[],
    reference?: string | null,
    options?: { warnAsError?: boolean }
  ): Promise<ValidationResult> {
    const parsedInput: InputFile[] = [];
    const parsedReference: InputFile[] = [];
    let preparedInput: unknown;
    let preparedReference: unknown;

    for (const file of input) {
      parsedInput.push({
        name: file,
        data: await parseChunked(fs.createReadStream(file)),
      });
      if (reference) {
        parsedReference.push({
          name: reference,
          data: await parseChunked(fs.createReadStream(reference)),
        });
        break;
      }
    }

    const result: ValidationResult = {
      rules: [],
      input: parsedInput.map((item) => item.name),
      reference: parsedReference.map((item) => item.name),
    };

    for (const [, plugin] of Object.entries(this.plugins)) {
      if (typeof plugin.prepare === 'function') {
        preparedInput = await plugin.prepare(parsedInput);

        if (parsedReference) {
          preparedReference = await plugin.prepare(parsedReference);
        }
      }
    }

    preparedInput ??= parsedInput;
    preparedReference ??= parsedReference;

    for (const [ruleName, ruleDesc] of Object.entries(
      this.config?.validate.rules ?? {}
    )) {
      let ruleParams: unknown;
      let execParams: RuleExecParams;

      if (Array.isArray(ruleDesc)) {
        [execParams, ruleParams] = ruleDesc;
      } else {
        execParams = ruleDesc;
      }
      const normalizedExecParams = this.normalizeExecParams(execParams);

      if (normalizedExecParams.mode === 'off') {
        continue;
      }

      const resolvedRule = this.resolveRule(ruleName);

      if (!resolvedRule) {
        throw new Error(`Can't resolve rule ${ruleName}`);
      }

      const api = await this.execRule(
        resolvedRule,
        ruleParams,
        { input: preparedInput, reference: preparedReference },
        options
      );
      result.rules.push({ name: ruleName, api });
    }

    return result;
  }

  async execRule(
    rule: Rule<unknown, unknown>,
    params: unknown,
    data: RuleDataInput<unknown>,
    options?: MakeAPIParams
  ): Promise<API> {
    const api = makeAPI(options);
    await rule(params, data, api);

    return api;
  }

  normalizeExecParams(execParams: RuleExecParams): NormalizedRuleExecParams {
    const mode: RuleExecMode = typeof execParams === 'string' ? execParams : 'error';

    return {
      mode,
    };
  }
}
