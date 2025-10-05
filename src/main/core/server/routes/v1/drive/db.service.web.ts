// Web 环境下的 drive 数据库服务模拟
const drive = {
  add: async (data: any) => {
    console.log('[DB] Adding drive data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing drive data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing drive data with ids:', ids);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating drive data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, kw?: string) => {
    console.log('[DB] Getting drive data page:', page, 'pageSize:', pageSize, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  active: async () => {
    console.log('[DB] Getting active drive data');
    return [];
  },
  get: async (id: string) => {
    console.log('[DB] Getting drive data with id:', id);
    return { id, name: 'Default Drive' };
  }
};

// Web 环境下的 setting 数据库服务模拟
const setting = {
  get: async (key: string) => {
    console.log('[DB] Getting setting with key:', key);
    if (key === 'defaultDrive') {
      return '1';
    }
    return null;
  },
  update: async (keys: string[], value: any) => {
    console.log('[DB] Updating setting with keys:', keys, 'and value:', value);
  }
};

export { drive, setting };