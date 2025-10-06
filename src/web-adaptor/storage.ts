// 本地存储工具类，用于在 Web 环境中模拟 Electron 的一些功能
class WebStorage {
  private prefix: string;

  constructor(prefix: string = 'zyweb_') {
    this.prefix = prefix;
  }

  // 设置项目
  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serializedValue);
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
    }
  }

  // 获取项目
  getItem(key: string): any {
    try {
      const serializedValue = localStorage.getItem(this.prefix + key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  }

  // 删除项目
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  }

  // 清空所有项目
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // 获取所有键
  getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.error('Failed to get keys from localStorage:', error);
      return [];
    }
  }
}

// 创建全局存储实例
const webStorage = new WebStorage();

// 导出存储工具
export { webStorage, WebStorage };
