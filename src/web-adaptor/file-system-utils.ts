// 文件系统工具类，用于处理 Electron 和 Web 之间的文件系统差异
class FileSystemUtils {
  // 检查是否支持 File API
  static supportsFileAPI(): boolean {
    return !!(window.File && window.FileReader && window.FileList && window.Blob);
  }

  // 检查是否支持拖放 API
  static supportsDragAndDrop(): boolean {
    return 'draggable' in document.createElement('span');
  }

  // 读取文件内容
  static async readFile(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target!.result!);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }

  // 读取文件为 ArrayBuffer
  static async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target!.result as ArrayBuffer);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  // 读取文件为 Data URL
  static async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target!.result as string);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  }

  // 创建文件
  static createFile(content: string, filename: string, mimeType: string = 'text/plain'): File {
    return new File([content], filename, { type: mimeType });
  }

  // 下载文件
  static downloadFile(content: string | Blob, filename: string): void {
    const blob = typeof content === 'string' ? new Blob([content]) : content;
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  // 检查是否支持 File System Access API
  static supportsFileSystemAccess(): boolean {
    return 'showOpenFilePicker' in window || 'showSaveFilePicker' in window;
  }

  // 打开文件选择对话框
  static async openFilePicker(acceptTypes: string[] = ['*/*']): Promise<File[] | null> {
    // 检查是否支持现代 File System Access API
    if (this.supportsFileSystemAccess() && 'showOpenFilePicker' in window) {
      try {
        // @ts-ignore
        const handles = await window.showOpenFilePicker({
          types: [{
            accept: {
              '*/*': acceptTypes
            }
          }],
          multiple: true
        });
        
        const files: File[] = [];
        for (const handle of handles) {
          const file = await handle.getFile();
          files.push(file);
        }
        
        return files;
      } catch (error) {
        console.error('Failed to open file picker:', error);
        return null;
      }
    } else {
      // 回退到传统的文件输入元素
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = acceptTypes.join(',');
        
        input.onchange = () => {
          if (input.files && input.files.length > 0) {
            resolve(Array.from(input.files));
          } else {
            resolve(null);
          }
        };
        
        input.click();
      });
    }
  }

  // 保存文件对话框
  static async saveFilePicker(content: string, filename: string, mimeType: string = 'text/plain'): Promise<boolean> {
    // 检查是否支持现代 File System Access API
    if (this.supportsFileSystemAccess() && 'showSaveFilePicker' in window) {
      try {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            accept: {
              [mimeType]: ['.txt']
            }
          }]
        });
        
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        
        return true;
      } catch (error) {
        console.error('Failed to save file:', error);
        return false;
      }
    } else {
      // 回退到传统的下载方式
      this.downloadFile(content, filename);
      return true;
    }
  }

  // 获取文件信息
  static getFileInfo(file: File): Record<string, any> {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      webkitRelativePath: (file as any).webkitRelativePath || ''
    };
  }

  // 检查文件大小是否在限制内
  static isFileSizeWithinLimit(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  // 读取目录内容（仅在支持 File System Access API 时可用）
  static async readDirectory(): Promise<FileSystemFileHandle[] | null> {
    if (!this.supportsFileSystemAccess() || !('showDirectoryPicker' in window)) {
      console.warn('Directory picker not supported');
      return null;
    }
    
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      const files: FileSystemFileHandle[] = [];
      
      // @ts-ignore
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          files.push(entry);
        }
      }
      
      return files;
    } catch (error) {
      console.error('Failed to read directory:', error);
      return null;
    }
  }
}

// 导出文件系统工具类
export { FileSystemUtils };