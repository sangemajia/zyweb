// Web 适配层，用于替代 Electron 预加载脚本的功能
import { webStorage } from './storage';
import { httpClient } from './http-client';
import { webSocketClient } from './websocket-client';
import { PlatformUtils } from './platform-utils';
import { FileSystemUtils } from './file-system-utils';

// 初始化 WebSocket 客户端
webSocketClient.connect();

// 模拟 removeLoading 函数
const removeLoading = () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
};

// 存储 IPC 监听器
const ipcListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

// 模拟 electron API 对象
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, data?: any) => {
      console.log(`[Web Adaptor] Sending IPC message to channel: ${channel}`, data);
      // 在 Web 环境中，我们可能需要通过其他方式处理这些消息
      // 例如，通过 HTTP 请求连接到后端服务
      switch (channel) {
        case 'open-url':
          if (data && typeof data === 'string') {
            window.open(data, '_blank');
          } else if (data && data.url) {
            window.open(data.url, '_blank');
          }
          break;
        case 'quit-app':
          console.log('Web version: Cannot quit app in browser');
          break;
        case 'reboot-app':
          console.log('Web version: Cannot reboot app in browser');
          window.location.reload();
          break;
        case 'open-path':
          console.log('Web version: Cannot open path in browser');
          break;
        case 'toggle-selfBoot':
          console.log('Web version: Cannot toggle self boot in browser');
          // 将开机自启设置发送到后端
          httpClient.post('/webbridge/session/manage', { action: 'selfBoot', data }).catch(error => {
            console.error('Failed to toggle self boot:', error);
          });
          break;
        case 'update-dns':
          console.log('Web version: DNS update not supported in browser, sending to backend');
          // 将 DNS 更新请求发送到后端
          httpClient.post('/webbridge/ipc/update-dns', data).catch(error => {
            console.error('Failed to update DNS:', error);
          });
          break;
        case 'check-for-update':
          console.log('Web version: Update check not supported in browser, sending to backend');
          // 将更新检查请求发送到后端
          httpClient.post('/webbridge/ipc/check-for-update', {}).catch(error => {
            console.error('Failed to check for updates:', error);
          });
          break;
        case 'win:invoke':
          console.log('Web version: Window management not supported in browser');
          break;
        case 'manage-win':
          console.log('Web version: Window management not supported in browser');
          break;
        case 'open-win':
          console.log('Web version: Window management not supported in browser');
          break;
        default:
          // 对于其他消息，我们可以通过 WebSocket 发送到后端
          console.log(`Web version: Sending message to backend via WebSocket for channel ${channel}`);
          webSocketClient.sendToChannel(channel, data);
          break;
      }
    },
    invoke: async (channel: string, ...args: any[]) => {
      console.log(`[Web Adaptor] Invoking IPC message to channel: ${channel}`, args);
      // 在 Web 环境中，我们可能需要通过 HTTP 请求或 WebSocket 连接到后端服务
      switch (channel) {
        case 'get-app-path':
          // 在 Web 环境中，我们使用 localStorage 模拟存储路径
          return Promise.resolve('/web/storage');
        case 'path-join':
          // 简单模拟路径连接
          return Promise.resolve(args.join('/'));
        case 'manage-file':
          // 在 Web 环境中，文件操作需要通过后端 API 处理
          const [action, config] = args;
          // 将文件操作请求发送到后端
          return httpClient.post('/webbridge/file/manage', { action, config }).catch(error => {
            console.error('Failed to manage file:', error);
            return { status: false, message: 'File operations failed' };
          });
        case 'manage-dialog':
          // 在 Web 环境中，对话框需要使用浏览器原生功能
          switch (args[0]?.type) {
            case 'open':
              console.log('Web version: Open file dialog');
              return FileSystemUtils.openFilePicker(args[0]?.accept || ['*/*']).then(files => {
                if (files) {
                  return { status: true, data: files.map(file => FileSystemUtils.getFileInfo(file)) };
                } else {
                  return { status: false, message: 'No files selected' };
                }
              }).catch(error => {
                console.error('Failed to open file dialog:', error);
                return { status: false, message: 'Failed to open file dialog' };
              });
            case 'save':
              console.log('Web version: Save file dialog');
              return FileSystemUtils.saveFilePicker(args[0]?.content || '', args[0]?.filename || 'file.txt', args[0]?.mimeType || 'text/plain').then(result => {
                return { status: true, data: result };
              }).catch(error => {
                console.error('Failed to save file dialog:', error);
                return { status: false, message: 'Failed to save file dialog' };
              });
            default:
              console.log('Web version: Dialog operations not supported in web version');
              return Promise.resolve(null);
          }
        case 'manage-boss-shortcut':
          // 在 Web 环境中，快捷键需要使用浏览器原生功能
          const [shortcutAction, shortcutConfig] = args;
          console.log('Web version: Shortcut management sending to backend');
          return httpClient.post('/webbridge/boss/shortcut', { action: shortcutAction, config: shortcutConfig }).catch(error => {
            console.error('Failed to manage boss shortcut:', error);
            return false;
          });
        case 'ffmpeg-check':
          // 在 Web 环境中，需要通过后端检查 ffmpeg
          console.log('Web version: FFmpeg check needs to be handled by backend');
          return httpClient.get('/webbridge/ffmpeg/check').catch(error => {
            console.error('Failed to check ffmpeg:', error);
            return false;
          });
        case 'ffmpeg-thumbnail':
          // 在 Web 环境中，需要通过后端生成缩略图
          const [url, id] = args;
          console.log('Web version: Thumbnail generation needs to be handled by backend');
          return httpClient.post('/webbridge/ffmpeg/thumbnail', { url, id }).catch(error => {
            console.error('Failed to generate thumbnail:', error);
            return null;
          });
        case 'call-player':
          // 在 Web 环境中，可能需要在浏览器中播放或跳转到播放页面
          console.log('Web version: Player call needs to be handled differently in web version');
          // 直接在浏览器中打开播放链接
          if (args[0] && args[0].url) {
            window.open(args[0].url, '_blank');
          }
          return Promise.resolve(true);
        case 'sniffer-media':
          // 在 Web 环境中，需要通过后端处理媒体嗅探
          console.log('Web version: Media sniffing needs to be handled by backend');
          return httpClient.post('/webbridge/sniffer/media', args[0]).catch(error => {
            console.error('Failed to sniff media:', error);
            return null;
          });
        case 'manage-pin':
          // 在 Web 环境中，固定窗口功能不可用
          console.log('Web version: Pin management not supported in web version');
          return Promise.resolve(false);
        case 'manage-session':
          // 在 Web 环境中，通过后端处理会话管理
          const [sessionAction] = args;
          console.log('Web version: Session management sending to backend');
          return httpClient.post('/webbridge/session/manage', { action: sessionAction }).catch(error => {
            console.error('Failed to manage session:', error);
            return { status: false, message: 'Session management failed' };
          });
        default:
          // 对于其他调用，我们可以通过 HTTP API 发送到后端
          console.log(`Web version: Invoking backend API for channel ${channel}`);
          return httpClient.post(`/webbridge/ipc/${channel}`, args).catch(error => {
            console.error(`Failed to invoke backend API for channel ${channel}:`, error);
            return null;
          });
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      console.log(`[Web Adaptor] Listening to IPC channel: ${channel}`);
      // 在 Web 环境中，我们通过 WebSocket 接收消息
      if (!ipcListeners.has(channel)) {
        ipcListeners.set(channel, []);
      }
      ipcListeners.get(channel)!.push(func);
      
      // 通过 WebSocket 监听频道
      webSocketClient.on(channel, (data) => {
        func({}, data);
      });
    },
    removeAllListeners: (channel: string) => {
      console.log(`[Web Adaptor] Removing all listeners for channel: ${channel}`);
      if (ipcListeners.has(channel)) {
        ipcListeners.delete(channel);
      }
      // 注意：WebSocket 客户端的监听器无法直接移除特定频道的监听器
      // 在实际应用中，可能需要更复杂的实现
    }
  }
};

// 将 API 添加到全局对象
window.electron = electronAPI;
window.removeLoading = removeLoading;

// 导出 API 以供模块使用
export { 
  removeLoading, 
  electronAPI, 
  webStorage, 
  httpClient, 
  webSocketClient, 
  PlatformUtils, 
  FileSystemUtils 
};