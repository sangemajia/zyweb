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
    if (key === 'ai') {
      // 在Web环境中返回默认的AI配置
      return { key: '', server: '' };
    }
    return null;
  },
  update: async (keys: string[], value: any) => {
    console.log('[DB] Updating setting with keys:', keys, 'and value:', value);
  },
  set: async (key: string, value: any) => {
    console.log('[DB] Setting setting with key:', key, 'and value:', value);
  },
  all: async () => {
    console.log('[DB] Getting all settings');
    return [];
  }
};

// Web 环境下的 history 数据库服务模拟
const history = {
  add: async (data: any) => {
    console.log('[DB] Adding history data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing history data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing history data with ids:', ids);
  },
  removeByType: async (type: string) => {
    console.log('[DB] Removing history data by type:', type);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating history data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, type: string | string[], kw?: string) => {
    console.log('[DB] Getting history data page:', page, 'pageSize:', pageSize, 'type:', type, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  get: async (id: string) => {
    console.log('[DB] Getting history data with id:', id);
    return { id };
  },
  find: async (relateId: string, videoId: string) => {
    console.log('[DB] Finding history data with relateId:', relateId, 'videoId:', videoId);
    return null;
  }
};

// Web 环境下的 star 数据库服务模拟
const star = {
  add: async (data: any) => {
    console.log('[DB] Adding star data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing star data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing star data with ids:', ids);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating star data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, kw?: string) => {
    console.log('[DB] Getting star data page:', page, 'pageSize:', pageSize, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  get: async (id: string) => {
    console.log('[DB] Getting star data with id:', id);
    return { id };
  }
};

// Web 环境下的 site 数据库服务模拟
const site = {
  add: async (data: any) => {
    console.log('[DB] Adding site data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing site data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing site data with ids:', ids);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating site data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, kw?: string) => {
    console.log('[DB] Getting site data page:', page, 'pageSize:', pageSize, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  active: async () => {
    console.log('[DB] Getting active site data');
    return [];
  },
  get: async (id: string) => {
    console.log('[DB] Getting site data with id:', id);
    return { id };
  },
  findByKey: async (key: string) => {
    console.log('[DB] Finding site data with key:', key);
    return null;
  }
};

// Web 环境下的 iptv 数据库服务模拟
const iptv = {
  add: async (data: any) => {
    console.log('[DB] Adding iptv data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing iptv data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing iptv data with ids:', ids);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating iptv data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, kw?: string) => {
    console.log('[DB] Getting iptv data page:', page, 'pageSize:', pageSize, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  active: async () => {
    console.log('[DB] Getting active iptv data');
    return [];
  },
  get: async (id: string) => {
    console.log('[DB] Getting iptv data with id:', id);
    return { id };
  },
  findByKey: async (key: string) => {
    console.log('[DB] Finding iptv data with key:', key);
    return null;
  }
};

// Web 环境下的 channel 数据库服务模拟
const channel = {
  add: async (data: any) => {
    console.log('[DB] Adding channel data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing channel data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing channel data with ids:', ids);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating channel data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, kw?: string) => {
    console.log('[DB] Getting channel data page:', page, 'pageSize:', pageSize, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  active: async () => {
    console.log('[DB] Getting active channel data');
    return [];
  },
  get: async (id: string) => {
    console.log('[DB] Getting channel data with id:', id);
    return { id };
  },
  findByKey: async (key: string) => {
    console.log('[DB] Finding channel data with key:', key);
    return null;
  }
};

// Web 环境下的 analyze 数据库服务模拟
const analyze = {
  add: async (data: any) => {
    console.log('[DB] Adding analyze data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing analyze data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing analyze data with ids:', ids);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating analyze data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, kw?: string) => {
    console.log('[DB] Getting analyze data page:', page, 'pageSize:', pageSize, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  active: async () => {
    console.log('[DB] Getting active analyze data');
    return [];
  },
  get: async (id: string) => {
    console.log('[DB] Getting analyze data with id:', id);
    return { id };
  },
  findByKey: async (key: string) => {
    console.log('[DB] Finding analyze data with key:', key);
    return null;
  }
};

// Web 环境下的 db 数据库服务模拟
const db = {
  add: async (data: any) => {
    console.log('[DB] Adding db data:', data);
    return { id: '1', ...data };
  },
  clear: async () => {
    console.log('[DB] Clearing db data');
  },
  remove: async (ids: string[]) => {
    console.log('[DB] Removing db data with ids:', ids);
  },
  update: async (ids: string[], doc: any) => {
    console.log('[DB] Updating db data with ids:', ids, 'and data:', doc);
    return { ids, ...doc };
  },
  page: async (page: number, pageSize: number, kw?: string) => {
    console.log('[DB] Getting db data page:', page, 'pageSize:', pageSize, 'keyword:', kw);
    return { list: [], total: 0 };
  },
  get: async (id: string) => {
    console.log('[DB] Getting db data with id:', id);
    return { id };
  }
};

export { drive, setting, history, star, site, iptv, channel, analyze, db };