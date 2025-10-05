// Web 环境下的 fs 模拟模块
// 在Web环境中，我们不能直接访问文件系统，所以这里只是模拟一些基本功能

// 模拟文件存储
const fileStorage = new Map<string, string>();

const existsSync = (filePath: string): boolean => {
  return fileStorage.has(filePath);
};

const statSync = (filePath: string): { isFile: () => boolean; isDirectory: () => boolean; size: number } => {
  if (fileStorage.has(filePath)) {
    return {
      isFile: () => true,
      isDirectory: () => false,
      size: fileStorage.get(filePath)?.length || 0,
    };
  }
  // 模拟目录
  let isDir = false;
  const keys = Array.from(fileStorage.keys());
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.startsWith(filePath + '/')) {
      isDir = true;
      break;
    }
  }
  return {
    isFile: () => false,
    isDirectory: () => isDir,
    size: 0,
  };
};

const writeFileSync = (filePath: string, content: string, encoding?: string): void => {
  fileStorage.set(filePath, content);
};

const readFileSync = (filePath: string, encoding?: string): string => {
  const content = fileStorage.get(filePath);
  if (content === undefined) {
    throw new Error(`File not found: ${filePath}`);
  }
  return content;
};

const unlinkSync = (filePath: string): void => {
  fileStorage.delete(filePath);
};

const readdirSync = (dirPath: string): string[] => {
  const files: string[] = [];
  const keys = Array.from(fileStorage.keys());
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.startsWith(dirPath + '/')) {
      const relativePath = key.substring(dirPath.length + 1);
      const parts = relativePath.split('/');
      if (parts.length > 0 && !files.includes(parts[0])) {
        files.push(parts[0]);
      }
    }
  }
  return files;
};

const rmSync = (path: string, options?: { recursive?: boolean }): void => {
  const keys = Array.from(fileStorage.keys());
  if (options?.recursive) {
    // 删除目录及其所有内容
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.startsWith(path)) {
        fileStorage.delete(key);
      }
    }
  } else {
    // 删除单个文件
    fileStorage.delete(path);
  }
};

const mkdirSync = (dirPath: string, options?: { recursive?: boolean }): void => {
  // 在Web环境中，我们不需要实际创建目录
  // 只需要确保路径存在即可
};

export { existsSync, statSync, writeFileSync, readFileSync, unlinkSync, readdirSync, rmSync, mkdirSync };