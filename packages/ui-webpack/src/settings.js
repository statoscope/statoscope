import EventEmitter from '@wdxlab/events';

const LS_KEY = 'statoscope_settings';

export class Value {
  constructor(value) {
    this.eventChange = new EventEmitter();
    this.eventChange.on((sender, { value }) => (this._value = value));
    if (value !== undefined) {
      this.set(value);
    }
  }

  set(value) {
    if (this._value !== value) {
      this.eventChange.emit(this, { value });
    }
  }

  get() {
    return this._value;
  }
}

export class Settings {
  constructor() {
    this.eventChanged = new EventEmitter();
    this.map = new Map();
    this._read();
    window.addEventListener('storage', () => this._read());
  }

  _read() {
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
      const value = data.hasOwnProperty(key) ? data[key] : undefined;
      this.set(key, value);
    }
  }

  _flush() {
    const data = {};
    for (const [key, value] of this.map) {
      data[key] = value.get();
    }

    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  _create(name, value) {
    const item = new Value(value);
    item.eventChange.on(() => {
      this._flush();
      this._scheduleUpdate();
    });
    this.map.set(name, item);

    return item;
  }

  _scheduleUpdate() {
    if (this._updateId) {
      clearTimeout(this._updateId);
    }
    this._updateId = setTimeout(() => {
      this.eventChanged.emit(this);
      this._updateId = 0;
    }, 0);
  }

  get(name, defaultValue) {
    let item = this.map.get(name);

    if (!item) {
      item = this._create(name, defaultValue);
    }

    return item;
  }

  set(name, value) {
    let item = this.map.get(name);

    if (!item) {
      item = this._create(name, value);
    } else {
      item.set(value);
    }

    return item;
  }
}

export default new Settings();

export const SETTING_HIDE_NODE_MODULES = 'hide_node_modules';
export const SETTING_HIDE_NODE_MODULES_DEFAULT = false;
export const SETTING_LIST_ITEMS_LIMIT = 'list_items_limit';
export const SETTING_LIST_ITEMS_LIMIT_DEFAULT = '20';
