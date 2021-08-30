import fs from 'fs';
// @ts-ignore
import { parseChunked } from '@discoveryjs/json-ext';
import { API } from '@statoscope/types/types/validation/api';
import { Result } from '@statoscope/types/types/validation/result';
import { Config } from '@statoscope/types/types/validation/config';
import {
  NormalizedExecParams,
  ExecParams,
  ExecMode,
} from '@statoscope/types/types/validation/rule';
import { makeRequireFromPath, resolveAliasPackage } from '@statoscope/config/dist/path';
import { makeAPI } from './api';
import { InputFile, PluginFn, PrepareFn } from './plugin';
import { Rule, RuleDataInput } from './rule';

export default class Validator {
  public rootDir!: string;
  public config!: Config;
  public require!: NodeRequire;
  public plugins: Record<
    string,
    {
      aliases: string[];
      prepare?: PrepareFn<unknown>;
      rules: Record<string, Rule<unknown, unknown>>;
    }
  > = {};

  constructor(config: Config, rootDir = process.cwd()) {
    this.applyConfig(config, rootDir);
  }

  applyConfig(config: Config, rootDir: string): void {
    this.rootDir = rootDir;
    this.config = config;
    this.require = makeRequireFromPath(rootDir);

    if (this.config.plugins) {
      for (const pluginName of this.config.plugins) {
        const pluginPath = Array.isArray(pluginName) ? pluginName[0] : pluginName;
        const normalizedPluginPath = resolveAliasPackage(
          ['stats-validator-plugin', 'statoscope-stats-validator-plugin'],
          pluginPath,
          rootDir
        );
        const pluginAlias = Array.isArray(pluginName) ? pluginName[1] : pluginName;
        const resolvedPluginPath = this.require.resolve(normalizedPluginPath);
        const pluginNS = this.require(resolvedPluginPath);
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

  async validate(input: string, reference?: string | null): Promise<Result> {
    const parsedInput: InputFile[] = [];
    let preparedInput: unknown;

    parsedInput.push({
      name: 'input.json',
      data: await parseChunked(fs.createReadStream(input)),
    });

    if (reference) {
      parsedInput.push({
        name: 'reference.json',
        data: await parseChunked(fs.createReadStream(reference)),
      });
    }

    const result: Result = {
      rules: [],
      files: {
        input: input,
        reference: reference,
      },
    };

    for (const [, plugin] of Object.entries(this.plugins)) {
      if (typeof plugin.prepare === 'function') {
        preparedInput = await plugin.prepare(parsedInput);
      }
    }

    preparedInput ??= parsedInput;

    for (const [ruleName, ruleDesc] of Object.entries(this.config?.rules ?? {})) {
      let ruleParams: unknown;
      let execParams: ExecParams;

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

      const api = await this.execRule(resolvedRule, ruleParams, preparedInput);
      result.rules.push({ name: ruleName, api, execParams: normalizedExecParams });
    }

    return result;
  }

  async execRule(
    rule: Rule<unknown, unknown>,
    params: unknown,
    data: RuleDataInput<unknown>
  ): Promise<API> {
    const api = makeAPI();
    await rule(params, data, api);

    return api;
  }

  normalizeExecParams(execParams: ExecParams): NormalizedExecParams {
    let mode: ExecMode = typeof execParams === 'string' ? execParams : 'error';

    if (mode === 'warn' && this.config.warnAsError) {
      mode = 'error';
    }

    return {
      mode,
    };
  }
}
