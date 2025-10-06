class publicStorage {
  name: string;
  settings: {};
  constructor(name: string) {
    this.name = name;
    this.settings = {};
  }

  get(key: string) {
    try {
      const storage = JSON.parse(localStorage.getItem(this.name) || '{}');
      return key ? storage[key] : storage;
    } catch (error) {
      return key ? this.settings[key] : this.settings;
    }
  }

  set(key: string, value: any) {
    try {
      const storage = Object.assign({}, this.get(''), {
        [key]: value,
      });
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      this.settings[key] = value;
    }
  }

  del(key: string) {
    try {
      const storage = this.get('');
      delete storage[key];
      localStorage.setItem(this.name, JSON.stringify(storage));
    } catch (error) {
      delete this.settings[key];
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.name);
    } catch (error) {
      this.settings = {};
    }
  }
}

const playerStorage = new publicStorage('player_settings');

export { playerStorage };
