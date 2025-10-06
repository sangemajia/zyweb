// 验证 webview 是否挂掉
export const validateAndRecoverWebview = async (
  webviewRef: any,
  controlText: string,
  isWebviewVisible: boolean,
  setIsWebviewVisible: (visible: boolean) => void,
  resetWebview: () => Promise<void>,
  bindDomReady: () => void,
  handleWebviewLoad: (url: string) => void,
) => {
  if (!webviewRef.value || !controlText) return;

  try {
    webviewRef.value.getURL();
  } catch {
    console.warn('webview 失效，正在恢复...');
    await resetWebview();
    bindDomReady();
    setTimeout(() => {
      handleWebviewLoad(controlText);
    }, 0);
  }
};

// 绑定 dom-ready 事件
export const bindDomReady = (webviewRef: any, controlText: string, handleWebviewLoad: (url: string) => void) => {
  if (!webviewRef.value) return;

  const loadWebview = () => {
    console.log('webview dom-ready');
    webviewRef.value?.removeEventListener('dom-ready', loadWebview);

    // ✅ dom-ready 后直接重新加载 controlText 的内容
    if (controlText) {
      handleWebviewLoad(controlText);
    }
  };

  webviewRef.value.removeEventListener('dom-ready', loadWebview);
  webviewRef.value.addEventListener('dom-ready', loadWebview);
};

// 重置 webview
export const resetWebview = async (isWebviewVisible: boolean, setIsWebviewVisible: (visible: boolean) => void) => {
  setIsWebviewVisible(false);
  await new Promise((resolve) => setTimeout(resolve, 0));
  setIsWebviewVisible(true);
  await new Promise((resolve) => setTimeout(resolve, 0));
};

// 处理 webview 加载
export const handleWebviewLoad = (url: string, setControlText: (text: string) => void, webviewRef: any) => {
  if (!url || url === 'about:blank') return;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    try {
      parsedUrl = new URL(`http://${url}`);
      url = parsedUrl.href;
    } catch {
      console.error('Invalid URL:', url);
      return;
    }
  }

  // 限制只允许 http/https 协议
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) return;
  setControlText(url);
  webviewRef.value?.loadURL(url);

  const setupWebviewListeners = () => {
    const webview = webviewRef.value;
    if (!webview) return;

    const webviewRoute = (event: { url: string }) => {
      if (setControlText === event.url) return;
      setControlText(event.url);
      console.log('webviewRoute', event.url);
    };

    // 移除之前的监听器（避免重复注册）
    webview.removeEventListener('did-navigate-in-page', webviewRoute);
    // webview.removeEventListener('did-navigate', webviewRoute);
    webview.removeEventListener('did-redirect-navigation', webviewRoute);

    // 添加新的监听器
    webview.addEventListener('did-navigate-in-page', webviewRoute);
    // webview.addEventListener('did-navigate', webviewRoute);
    webview.addEventListener('did-redirect-navigation', webviewRoute);
  };

  const setupIpcListeners = () => {
    // 只清除 blockUrl 监听器，防止其他 ipc 消息被误删
    window.electron.ipcRenderer.removeAllListeners('blockUrl');

    window.electron.ipcRenderer.on('blockUrl', async (_, blockedUrl: string) => {
      handleWebviewLoad(blockedUrl, setControlText, webviewRef);
    });
  };

  setTimeout(() => {
    setupWebviewListeners();
    setupIpcListeners();
  }, 0);
};

// 处理 webview 控制
export const handleWebviewControl = async (
  action: 'back' | 'forward' | 'devtools' | 'refresh' | 'clearHistory',
  webviewRef: any,
) => {
  const webview = webviewRef.value;
  if (!webview) return;

  // 后退
  const backEvent = () => {
    if (webview.canGoBack()) webview.goBack();
  };

  // 前进
  const forwardEvent = () => {
    if (webview.canGoForward()) webview.goForward();
  };

  // 刷新
  const refreshEvent = () => {
    webview.reload();
  };

  // 清除浏览器导航历史记录
  const clearHistoryEvent = () => {
    webview.clearHistory();
  };

  const openDevToolsEvent = () => {
    webview.openDevTools();
  };

  const method = {
    back: backEvent,
    devtools: openDevToolsEvent,
    forward: forwardEvent,
    refresh: refreshEvent,
    clearHistory: clearHistoryEvent,
  };

  method[action]();
};
