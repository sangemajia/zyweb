class PlayerStorage {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  private getStorageKey(key: string): string {
    return `${this.namespace}_${key}`;
  }

  get(key: string): any {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      if (item === null) {
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error getting item from storage for key "${key}":`, error);
      return null;
    }
  }

  set(key: string, value: any): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in storage for key "${key}":`, error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(key));
    } catch (error) {
      console.error(`Error removing item from storage for key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      // 只清除当前命名空间下的数据
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.namespace}_`)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(this.getStorageKey(key)) !== null;
    } catch (error) {
      console.error(`Error checking item in storage for key "${key}":`, error);
      return false;
    }
  }
}

export { PlayerStorage };
