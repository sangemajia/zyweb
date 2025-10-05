// Web 环境下的文件操作工具
import fs from 'fs';
import { join } from 'path';
import { gzip } from './crypto.web';

// 检查文件或目录是否存在
const fileExist = async (filePath: string): Promise<boolean> => {
  if (!filePath) return false;
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

const fileExistSync = (filePath: string): boolean => {
  if (!filePath) return false;
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

// 获取文件或目录的状态
const fileState = async (filePath: string): Promise<'file' | 'dir' | 'unknown'> => {
  try {
    const state = fs.statSync(filePath);
    return state.isFile() ? 'file' : state.isDirectory() ? 'dir' : 'unknown';
  } catch {
    return 'unknown';
  }
};

const fileStateSync = (filePath: string): 'file' | 'dir' | 'unknown' => {
  try {
    const state = fs.statSync(filePath);
    return state.isFile() ? 'file' : state.isDirectory() ? 'dir' : 'unknown';
  } catch {
    return 'unknown';
  }
};

// 保存文件
const saveFile = async (filePath: string, content: string, crypto: number = 0): Promise<boolean> => {
  try {
    if (!filePath) return false;
    if (crypto !== 0) content = gzip.encode(content);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch {
    return false;
  }
};

// 保存文件
const saveFileSync = (filePath: string, content: string, crypto: number = 0): boolean => {
  try {
    if (!filePath) return false;
    if (crypto !== 0) content = gzip.encode(content);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch {
    return false;
  }
};

// 保存 JSON 文件
const saveJson = async (filePath: string, content: object): Promise<boolean> => {
  try {
    if (!filePath) return false;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
};

// 保存 JSON 文件
const saveJsonSync = (filePath: string, content: object): boolean => {
  try {
    if (!filePath) return false;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
};

// 读取文件
const readFile = async (filePath: string, crypto: number = 0): Promise<string | false> => {
  try {
    if (!fileExistSync(filePath) || fileStateSync(filePath) !== 'file') return false;
    let content = fs.readFileSync(filePath, 'utf8');
    if (crypto !== 0) content = gzip.decode(content);
    return content;
  } catch {
    return false;
  }
};

const readFileSync = (filePath: string, crypto: number = 0): string | false => {
  try {
    if (!fileExistSync(filePath) || fileStateSync(filePath) !== 'file') return false;
    let content = fs.readFileSync(filePath, 'utf8');
    if (crypto !== 0) content = gzip.decode(content);
    return content;
  } catch {
    return false;
  }
};

// 读取 JSON 文件
const readJson = async (filePath: string): Promise<any | false> => {
  try {
    if (!fileExistSync(filePath) || fileStateSync(filePath) !== 'file') return false;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return false;
  }
};

const readJsonSync = (filePath: string): any | false => {
  try {
    if (!fileExistSync(filePath) || fileStateSync(filePath) !== 'file') return false;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return false;
  }
};

// 删除文件
const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
};

const deleteFileSync = (filePath: string): boolean => {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
};

// 读取目录内容
const readDir = async (dirPath: string): Promise<string[] | false> => {
  try {
    if (!dirPath) return false;
    if (!fileExistSync(dirPath) || fileStateSync(dirPath) !== 'dir') return false;
    return fs.readdirSync(dirPath);
  } catch {
    return false;
  }
};

const readDirSync = (dirPath: string): string[] | false => {
  try {
    if (!dirPath) return false;
    if (!fileExistSync(dirPath) || fileStateSync(dirPath) !== 'dir') return false;
    return fs.readdirSync(dirPath);
  } catch {
    return false;
  }
};

// 删除目录
const deleteDir = async (dirPath: string): Promise<boolean> => {
  try {
    fs.rmSync(dirPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

const deleteDirSync = (dirPath: string): boolean => {
  try {
    fs.rmSync(dirPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

// 创建目录
const createDir = async (dirPath: string): Promise<boolean> => {
  try {
    if (!dirPath) return false;
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

const createDirSync = (dirPath: string): boolean => {
  try {
    if (!dirPath) return false;
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

// 获取文件夹大小
const fileSize = async (folderPath: string): Promise<number> => {
  let totalSize = 0;

  try {
    if (!fileExistSync(folderPath)) return 0;
    const status = fileStateSync(folderPath);

    if (status === 'dir') {
      const entries = readDirSync(folderPath);
      if (!entries) return 0;

      for (const entry of entries) {
        const entryPath = join(folderPath, entry);
        const entryStatus = fileStateSync(entryPath);

        if (entryStatus === 'file') {
          totalSize += fs.statSync(entryPath).size;
        } else if (entryStatus === 'dir') {
          totalSize += fileSizeSync(entryPath);
        }
      }
    } else if (status === 'file') {
      return fs.statSync(folderPath).size;
    }

    return totalSize;
  } catch {
    return 0;
  }
};

const fileSizeSync = (folderPath: string): number => {
  let totalSize = 0;
  try {
    if (!fileExistSync(folderPath)) return 0;
    const status = fileStateSync(folderPath);

    if (status === 'dir') {
      const entries = readDirSync(folderPath);
      if (!entries) return 0;

      for (const entry of entries) {
        const entryPath = join(folderPath, entry);
        const entryStatus = fileStateSync(entryPath);

        if (entryStatus === 'file') {
          totalSize += fs.statSync(entryPath).size;
        } else if (entryStatus === 'dir') {
          totalSize += fileSizeSync(entryPath);
        }
      }
    } else if (status === 'file') {
      return fs.statSync(folderPath).size;
    }

    return totalSize;
  } catch {
    return 0;
  }
};

export {
  fileExist,
  fileExistSync,
  fileSize,
  fileSizeSync,
  fileState,
  fileStateSync,
  deleteFile,
  deleteFileSync,
  readFile,
  readFileSync,
  saveFile,
  saveFileSync,
  saveJson,
  saveJsonSync,
  readDir,
  readDirSync,
  readJson,
  readJsonSync,
  deleteDir,
  deleteDirSync,
  createDir,
  createDirSync,
};