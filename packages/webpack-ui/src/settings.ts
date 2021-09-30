import EventEmitter from '@wdxlab/events';
import { TYPE_3G_FAST } from '@statoscope/helpers/dist/network-type-list';

const LS_KEY = 'statoscope_settings';

export class Value<TValue> {
  eventChange = new EventEmitter<unknown, { value: TValue }>();
  // @ts-ignore
  _value: TValue;

  constructor(value: TValue) {
    this.eventChange.on((sender, { value }) => (this._value = value));
    this.set(value);
  }

  set(value: TValue): void {
    if (this._value !== value) {
      this.eventChange.emit(this, { value });
    }
  }

  get(): TValue {
    return this._value;
  }
}

export class Settings {
  eventChanged = new EventEmitter();
  map = new Map<string, Value<unknown>>();
  _updateId = 0;

  constructor() {
    this._read();
    window.addEventListener('storage', () => this._read());
  }

  _read(): void {
    let data;

    try {
      data = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    } catch (e) {
      data = {};
      localStorage.setItem(LS_KEY, '{}');
    }

    for (const name in data) {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(name)) {
        this.set(name, data[name]);
      }
    }

    for (const [key] of this.map) {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(key)) {
        this.set(key, data[key]);
      }
    }
  }

  _flush(): void {
    const data: Record<string, unknown> = {};
    for (const [key, value] of this.map) {
      data[key] = value.get();
    }

    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  _create<TValue>(name: string, value: TValue): Value<TValue> {
    const item = new Value(value);
    item.eventChange.on(() => {
      this._flush();
      this._scheduleUpdate();
    });
    this.map.set(name, item);

    return item;
  }

  _scheduleUpdate(): void {
    if (this._updateId) {
      clearTimeout(this._updateId);
    }
    // @ts-ignore
    this._updateId = setTimeout(() => {
      this.eventChanged.emit(this, null);
      this._updateId = 0;
    }, 0);
  }

  get<TValue>(name: string, defaultValue: TValue): Value<TValue> {
    let item = this.map.get(name);

    if (!item) {
      item = this._create(name, defaultValue);
    }

    return item as Value<TValue>;
  }

  set<TValue>(name: string, value: TValue): Value<TValue> {
    let item = this.map.get(name);

    if (!item) {
      item = this._create(name, value);
    } else {
      item.set(value);
    }

    return item as Value<TValue>;
  }
}

export default new Settings();

export const SETTING_HIDE_NODE_MODULES = 'hide_node_modules';
export const SETTING_HIDE_NODE_MODULES_DEFAULT = false;
export const SETTING_HIDE_CHILD_COMPILATIONS = 'hide_child_compilations';
export const SETTING_HIDE_CHILD_COMPILATIONS_DEFAULT = true;
export const SETTING_LIST_ITEMS_LIMIT = 'list_items_limit';
export const SETTING_LIST_ITEMS_LIMIT_DEFAULT = '20';
export const SETTING_SHOW_COMPRESSED = 'show_compressed';
export const SETTING_SHOW_COMPRESSED_DEFAULT = true;
export const SETTING_NETWORK_SPEED = 'network_speed';
export const SETTING_NETWORK_SPEED_DEFAULT = TYPE_3G_FAST.name;
export const SETTING_ASSETS_INJECT_TYPE = 'assets_inject_type';
export const SETTING_ASSETS_INJECT_TYPE_DEFAULT = 'sync';
export const SETTING_EXCLUDE_RESOURCES_FROM_SIZE_CALC =
  'exclude_resources_from_size_calc';
export const SETTING_EXCLUDE_RESOURCES_FROM_SIZE_CALC_DEFAULT = '\\.(map)$';
