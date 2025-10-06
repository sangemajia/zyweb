import { join } from 'path';

// 在 Web 环境中模拟 Electron 的 app.getPath 方法
const getAppPath = (name: string): string => {
  // 在 Web 环境中，我们使用 localStorage 模拟存储路径
  const baseStoragePath = '/web/storage';

  switch (name) {
    case 'userData':
      return join(baseStoragePath, 'user-data');
    case 'temp':
      return join(baseStoragePath, 'tmp');
    case 'logs':
      return join(baseStoragePath, 'logs');
    case 'documents':
      return join(baseStoragePath, 'documents');
    case 'downloads':
      return join(baseStoragePath, 'downloads');
    case 'music':
      return join(baseStoragePath, 'music');
    case 'pictures':
      return join(baseStoragePath, 'pictures');
    case 'videos':
      return join(baseStoragePath, 'videos');
    default:
      return baseStoragePath;
  }
};

// 获取应用路径
const getAppDefaultPath = (name: string): string => {
  return getAppPath(name);
};

const APP_MARK = 'zy';
const APP_MARK_PATH = `${APP_MARK}://`;

// 在 Web 环境中，我们使用固定的路径
const APP_STORE_PATH = '/web/storage/user-data';
const APP_TMP_PATH = join(APP_STORE_PATH, 'tmp');
const APP_DB_PATH = join(APP_STORE_PATH, 'database');
const APP_LOG_PATH = join(APP_STORE_PATH, 'log');
const APP_PLUGIN_PATH = join(APP_STORE_PATH, 'plugin');
const APP_FILE_PATH = join(APP_STORE_PATH, 'file');
const APP_CONFIG_PATH = join(APP_STORE_PATH, 'config');
const APP_PUBLIC_PATH = '/web/public';
const APP_RUNTIME_PATH = '/web/runtime';

// 检查路径是否以特定前缀开头
const isAppMarkPath = (url: string): boolean => url.startsWith(APP_MARK_PATH);
const isAppStorePath = (url: string): boolean => url.startsWith(APP_STORE_PATH);

// 路径转换：相对路径转绝对路径
const relativeToAbsolute = (path: string): string => {
  return isAppMarkPath(path) ? path.replace(APP_MARK_PATH, APP_STORE_PATH) : path;
};

// 路径转换：绝对路径转相对路径
const absoluteToRelative = (path: string): string => {
  return isAppStorePath(path) ? path.replace(APP_STORE_PATH, APP_MARK_PATH) : path;
};

export {
  APP_MARK,
  APP_MARK_PATH,
  APP_STORE_PATH,
  APP_TMP_PATH,
  APP_DB_PATH,
  APP_LOG_PATH,
  APP_PLUGIN_PATH,
  APP_FILE_PATH,
  APP_CONFIG_PATH,
  APP_PUBLIC_PATH,
  APP_RUNTIME_PATH,
  isAppMarkPath,
  isAppStorePath,
  getAppDefaultPath,
  relativeToAbsolute,
  absoluteToRelative,
};
