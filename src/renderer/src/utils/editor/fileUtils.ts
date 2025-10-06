// 文件操作工具函数
import { MessagePlugin } from 'tdesign-vue-next';

// 读取文件内容
export const readFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsText(file);
  });
};

// 保存文件内容
export const saveFile = async (content: string, filename: string): Promise<void> => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 检查文件类型
export const checkFileType = (filename: string): string => {
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.json')) return 'json';
  return 'text';
};

export default {
  readFile,
  saveFile,
  checkFileType,
};
